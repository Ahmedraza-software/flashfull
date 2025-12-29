from __future__ import annotations

import json
from calendar import monthrange
from datetime import date, datetime, time, timedelta
import os
import io
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import or_
from sqlalchemy.orm import Session

from fpdf import FPDF
from pydantic import BaseModel

from app.core.database import get_db
from app.api.dependencies import require_permission, get_current_active_user
from app.models.attendance import AttendanceRecord
from app.models.employee2 import Employee2
from app.models.employee_advance_deduction import EmployeeAdvanceDeduction
from app.models.payroll_sheet_entry import PayrollSheetEntry
from app.models.user import User


router = APIRouter(dependencies=[Depends(require_permission("payroll:view"))])


def _parse_date(d: str, *, field: str) -> date:
    try:
        y, m, dd = d.split("-")
        return date(int(y), int(m), int(dd))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"{field} must be in YYYY-MM-DD format") from e


def _month_label(d: date) -> str:
    return f"{d.year:04d}-{d.month:02d}"


def _days_inclusive(start: date, end: date) -> int:
    return int((end - start).days) + 1


def _days_exclusive_end(start: date, end: date) -> int:
    return int((end - start).days)


def _to_float(v) -> float:
    if v is None:
        return 0.0
    try:
        s = str(v).strip()
        if s == "":
            return 0.0
        return float(s)
    except Exception:
        return 0.0


def _normalize_attendance_status_and_leave_type(status: str | None, leave_type: str | None) -> tuple[str, str | None]:
    st = (status or "").strip().lower()
    lt = (leave_type or "").strip().lower() or None

    if st in ("", "-", "unmarked"):
        return "unmarked", None

    if st.startswith("leave"):
        if lt is None:
            if "unpaid" in st:
                lt = "unpaid"
            elif "paid" in st:
                lt = "paid"
        return "leave", lt

    if st in ("present", "late", "absent"):
        return st, None

    return st, lt


@router.get("/range-report")
async def payroll2_range_report(
    from_date: str,
    to_date: str,
    month: str | None = None,
    db: Session = Depends(get_db),
) -> dict:
    """
    Payroll2 range report with correct attendance counting.
    
    Key fields:
    - presents_total: Total present days from attendance (present + late status)
    - pre_days: Editable field for previous month portion
    - cur_days: Editable field for current month portion
    - total_days: pre_days + cur_days + leave_encashment (used for salary calculation)
    """
    start = _parse_date(from_date, field="from_date")
    end = _parse_date(to_date, field="to_date")
    if start > end:
        raise HTTPException(status_code=400, detail="from_date must be <= to_date")

    month_label = month or _month_label(end)
    cutoff = datetime.combine(end, time.max)
    # Payroll2 treats to_date as exclusive (count days between dates, not including to_date)
    working_days = _days_exclusive_end(start, end)
    if working_days < 0:
        working_days = 0

    # Load all employees
    employees = (
        db.query(Employee2)
        .filter(or_(Employee2.created_at == None, Employee2.created_at <= cutoff))
        .all()
    )
    
    # Sort by serial_no numerically
    def sort_key(e):
        try:
            return int(e.serial_no or 0)
        except (ValueError, TypeError):
            return 999999
    employees = sorted(employees, key=sort_key)

    # Load all attendance records in the date range
    attendance = (
        db.query(AttendanceRecord)
        .filter(AttendanceRecord.date >= start, AttendanceRecord.date < end)
        .all()
    )

    # Build lookup: employee_id -> date -> record
    by_emp_by_date: dict[str, dict[date, AttendanceRecord]] = {}
    for rec in attendance:
        emp_id = str(rec.employee_id or "").strip()
        # Ensure date is a date object
        if isinstance(rec.date, str):
            rec_date = date.fromisoformat(rec.date)
        else:
            rec_date = rec.date
        by_emp_by_date.setdefault(emp_id, {})[rec_date] = rec

    # Load sheet entries (user overrides)
    sheet_by_emp_db_id: dict[int, PayrollSheetEntry] = {
        r.employee_db_id: r
        for r in db.query(PayrollSheetEntry)
        .filter(PayrollSheetEntry.from_date == start, PayrollSheetEntry.to_date == end)
        .all()
    }

    # Load advance deductions
    advance_ded_by_emp_db_id: dict[int, float] = {
        r.employee_db_id: float(r.amount or 0.0)
        for r in db.query(EmployeeAdvanceDeduction)
        .filter(EmployeeAdvanceDeduction.month == month_label)
        .all()
    }

    rows: list[dict] = []
    total_gross = 0.0
    total_net = 0.0
    total_presents = 0

    for e in employees:
        # Employee ID used for attendance lookup
        employee_id = str(e.fss_no or e.serial_no or e.id).strip()
        
        base_salary = _to_float(e.salary)
        # Daily rate is computed from the selected payroll period day count (to_date is exclusive)
        day_rate = (base_salary / float(working_days)) if working_days > 0 else 0.0

        # Count attendance from records
        present_days = 0
        late_days = 0
        absent_days = 0
        paid_leave_days = 0
        unpaid_leave_days = 0

        overtime_minutes = 0
        overtime_pay = 0.0
        overtime_rate = 0.0

        late_minutes = 0
        late_deduction = 0.0

        fine_deduction = 0.0
        
        # Track present dates for tooltip - grouped by month
        present_dates_prev: list[str] = []  # Previous month dates
        present_dates_cur: list[str] = []   # Current month dates
        end_month = end.month

        # Iterate through each day in the range (end date is exclusive)
        dcur = start
        while dcur < end:
            a = by_emp_by_date.get(employee_id, {}).get(dcur)
            
            if a is not None:
                st, lt = _normalize_attendance_status_and_leave_type(a.status, a.leave_type)
                
                if st == "present":
                    present_days += 1
                    date_str = dcur.strftime("%d %b")
                    if dcur.month == end_month:
                        present_dates_cur.append(date_str)
                    else:
                        present_dates_prev.append(date_str)
                elif st == "late":
                    late_days += 1
                    date_str = dcur.strftime("%d %b") + " (L)"
                    if dcur.month == end_month:
                        present_dates_cur.append(date_str)
                    else:
                        present_dates_prev.append(date_str)
                elif st == "absent":
                    absent_days += 1
                elif st == "leave":
                    if (lt or "").lower().strip() == "unpaid":
                        unpaid_leave_days += 1
                    else:
                        paid_leave_days += 1

                # OT calculation
                if a.overtime_minutes and a.overtime_rate:
                    overtime_minutes += int(a.overtime_minutes or 0)
                    overtime_pay += (float(a.overtime_minutes) / 60.0) * float(a.overtime_rate)
                
                # Track OT rate (use latest non-zero)
                if a.overtime_rate and float(a.overtime_rate or 0) > 0:
                    overtime_rate = float(a.overtime_rate)

                # Late tracking
                if a.late_minutes:
                    late_minutes += int(a.late_minutes or 0)
                if a.late_deduction:
                    late_deduction += float(a.late_deduction or 0)

                # Fine from attendance
                if a.fine_amount:
                    fine_deduction += float(a.fine_amount or 0)

            dcur = dcur + timedelta(days=1)

        # Presents Total (paid days) = present + late + paid leave
        # UI shows Leave (L), but payroll counts PAID leave as paid/present day.
        presents_total = present_days + late_days + paid_leave_days
        total_presents += presents_total

        # Get sheet entry (user overrides)
        sheet = sheet_by_emp_db_id.get(e.id)
        
        # Pre/Cur days from sheet (editable by user) - for display/reference only
        if sheet and sheet.pre_days_override is not None:
            pre_days = int(sheet.pre_days_override)
        else:
            pre_days = 0
        
        if sheet and sheet.cur_days_override is not None:
            cur_days = int(sheet.cur_days_override)
        else:
            cur_days = 0
        
        leave_encashment_days = int(sheet.leave_encashment_days or 0) if sheet else 0

        # Total days = Paid days + Leave Encashment
        total_days = presents_total + leave_encashment_days
        if total_days < 0:
            total_days = 0

        # Total salary based on total_days
        total_salary = float(total_days) * day_rate

        # Other sheet fields
        allow_other = float(sheet.allow_other or 0.0) if sheet else 0.0
        eobi = float(sheet.eobi or 0.0) if sheet else 0.0
        tax = float(sheet.tax or 0.0) if sheet else 0.0
        fine_adv_extra = float(sheet.fine_adv_extra or 0.0) if sheet else 0.0
        remarks = (sheet.remarks if sheet else None)
        bank_cash = (sheet.bank_cash if sheet else None)

        # Advance deduction
        adv_ded = float(advance_ded_by_emp_db_id.get(e.id, 0.0) or 0.0)
        
        # Total fine/adv = attendance fine + advance deduction + extra fine/adv
        fine_adv = fine_deduction + adv_ded + fine_adv_extra

        # Gross = Total Salary + OT Amount + Allow/Other
        # (overtime_rate is a rate, not an earning)
        gross_pay = total_salary + overtime_pay + allow_other

        # Net = Gross - EOBI - Tax - Fine/Adv - Late Deduction
        net_pay = gross_pay - eobi - tax - fine_adv - late_deduction

        total_gross += gross_pay
        total_net += net_pay

        # Parse bank details to extract separate fields
        bank_name = ""
        bank_account_number = ""
        if e.bank_accounts:
            try:
                banks = json.loads(e.bank_accounts)
                if isinstance(banks, list) and len(banks) > 0:
                    first_bank = banks[0]
                    bank_name = first_bank.get('bank_name', '') or ''
                    bank_account_number = first_bank.get('account_number', '') or ''
            except (json.JSONDecodeError, TypeError):
                pass

        rows.append({
            "employee_db_id": e.id,
            "employee_id": employee_id,
            "name": e.name or "",
            "serial_no": e.serial_no,
            "fss_no": e.fss_no,
            "eobi_no": e.eobi_no,
            "cnic": e.cnic or "",
            "mobile_no": (e.mobile_no or e.home_contact or ""),
            "bank_name": bank_name,
            "bank_account_number": bank_account_number,
            "base_salary": base_salary,
            "working_days": working_days,
            "day_rate": day_rate,
            # Attendance counts
            "presents_total": presents_total,
            "present_dates_prev": present_dates_prev,
            "present_dates_cur": present_dates_cur,
            "present_days": present_days,
            "late_days": late_days,
            "absent_days": absent_days,
            "paid_leave_days": paid_leave_days,
            "unpaid_leave_days": unpaid_leave_days,
            # Editable fields
            "pre_days": pre_days,
            "cur_days": cur_days,
            "leave_encashment_days": leave_encashment_days,
            # Calculated
            "total_days": total_days,
            "total_salary": total_salary,
            # OT
            "overtime_minutes": overtime_minutes,
            "overtime_rate": overtime_rate,
            "overtime_pay": overtime_pay,
            # Late
            "late_minutes": late_minutes,
            "late_deduction": late_deduction,
            # Other
            "allow_other": allow_other,
            "gross_pay": gross_pay,
            # Deductions
            "eobi": eobi,
            "tax": tax,
            "fine_deduction": fine_deduction,
            "fine_adv_extra": fine_adv_extra,
            "fine_adv": fine_adv,
            "advance_deduction": adv_ded,
            # Net
            "net_pay": net_pay,
            # Other
            "remarks": remarks,
            "bank_cash": bank_cash,
        })

    summary = {
        "month": month_label,
        "from_date": start.isoformat(),
        "to_date": end.isoformat(),
        "working_days": working_days,
        "employees": len(rows),
        "total_gross": total_gross,
        "total_net": total_net,
        "total_presents": total_presents,
    }

    return {"month": month_label, "summary": summary, "rows": rows}


class Payroll2RowExport(BaseModel):
    serial_no: Optional[str] = None
    fss_no: Optional[str] = None
    name: str
    base_salary: float
    mobile_no: Optional[str] = ""
    presents_total: int
    paid_leave_days: Optional[int] = 0
    pre_days: int
    cur_days: int
    leave_encashment_days: int
    total_days: int
    total_salary: float
    overtime_rate: float
    overtime_minutes: int = 0
    overtime_pay: float
    allow_other: float
    gross_pay: float
    eobi_no: Optional[str] = None
    eobi: float
    tax: float
    fine_deduction: float
    fine_adv: float
    net_pay: float
    remarks: Optional[str] = None
    bank_cash: Optional[str] = None
    
    # Additional fields that may come from frontend
    cnic: Optional[str] = ""
    bank_details: Optional[str] = ""
    bank_name: Optional[str] = ""
    bank_account_number: Optional[str] = ""

class Payroll2ExportRequest(BaseModel):
    rows: List[Payroll2RowExport]

def _fmt_money(v: float) -> str:
    if v == 0:
        return "0"
    return f"{v:,.0f}"


class PayrollPDF(FPDF):
    """Custom PDF class with header repetition on each page"""
    
    def __init__(self, month: str, from_date: str, to_date: str, headers: list, col_widths: list, admin_name: str = "Admin"):
        # Use A3 landscape so all columns fit (A4 landscape is too narrow and cuts columns off)
        super().__init__(orientation="L", unit="mm", format="A3")
        self.month = month
        self.from_date = from_date
        self.to_date = to_date
        self.headers = headers
        self.col_widths = col_widths
        self.admin_name = admin_name
        self.set_auto_page_break(auto=True, margin=8)
        self.set_left_margin(3)
        self.set_right_margin(3)
        
        # Find logo path
        self.logo_path = None
        possible_paths = [
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "frontend-next", "Logo.png"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "Logo-removebg-preview.png"),
        ]
        for p in possible_paths:
            if os.path.exists(p):
                self.logo_path = p
                break
    
    def header(self):
        # Logo and company info
        start_y = self.get_y()
        if self.logo_path:
            try:
                self.image(self.logo_path, x=3, y=3, w=20)
            except:
                pass
        
        # Title next to logo
        self.set_xy(25, 3)
        self.set_font("Helvetica", "B", 12)
        self.cell(100, 5, "Flash ERP - Payroll Sheet", ln=False)
        
        # Right side info
        self.set_xy(200, 3)
        self.set_font("Helvetica", "", 7)
        self.cell(0, 4, f"Month: {self.month}", ln=True, align="R")
        self.set_x(200)
        self.cell(0, 4, f"Period: {self.from_date} to {self.to_date}", ln=True, align="R")
        self.set_x(200)
        self.cell(0, 4, f"Generated by: {self.admin_name}", ln=True, align="R")
        self.set_x(200)
        self.cell(0, 4, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True, align="R")
        
        self.set_y(20)
        
        # Table headers
        self.set_font("Helvetica", "B", 5)
        self.set_fill_color(220, 220, 220)
        for i, h in enumerate(self.headers):
            self.cell(self.col_widths[i], 4, h, border=1, align="C", fill=True)
        self.ln()
    
    def footer(self):
        self.set_y(-10)
        self.set_font("Helvetica", "I", 6)
        self.cell(0, 4, f"Page {self.page_no()}", align="C")


@router.post("/export-pdf")
async def export_payroll2_pdf(
    from_date: str,
    to_date: str,
    month: str,
    body: Payroll2ExportRequest,
    current_user: User = Depends(get_current_active_user),
):
    """Export payroll2 data as PDF"""
    try:
        rows = body.rows
        admin_name = current_user.full_name or current_user.username or "Admin"
        
        # All columns including CNIC and Bank Details with better spacing
        headers = ["#", "FSS No.", "Employee Name", "CNIC", "Mobile", "Bank Name", "Bank Account Number", "Salary/Month", "Presents", "Paid Leave", "Total", "Pre Days", "Cur Days", "Leave Enc.", "Total Days", "Total Salary", "OT Rate", "OT", "OT Amount", "Allow./Other", "Gross Salary", "EOBI", "#", "EOBI", "Tax", "Fine (Att)", "Fine/Adv.", "Net Payable", "Remarks", "Bank/Cash"]
        # Wider columns for long text fields; total width tuned to fit A3 landscape.
        col_widths = [8, 12, 26, 20, 18, 22, 24, 16, 10, 8, 8, 8, 8, 10, 10, 16, 12, 8, 12, 12, 16, 14, 8, 10, 10, 10, 10, 16, 22, 18]
        
        pdf = PayrollPDF(month, from_date, to_date, headers, col_widths, admin_name)
        pdf.add_page()
        
        # Table rows with larger font and better spacing
        pdf.set_font("Helvetica", "", 6)
        total_gross = 0.0
        total_net = 0.0

        def _truncate(s: str, max_len: int) -> str:
            ss = (s or "").strip()
            if len(ss) <= max_len:
                return ss
            if max_len <= 3:
                return ss[:max_len]
            return ss[: max_len - 2] + ".."
        
        def _get_bank_name_from_details(bank_details):
            """Extract bank name from bank_details string."""
            try:
                if not bank_details:
                    return ""
                banks = json.loads(bank_details)
                if isinstance(banks, list) and len(banks) > 0:
                    return banks[0].get('bank_name', '') or ''
            except:
                pass
            return ""
        
        def _get_bank_account_number_from_details(bank_details):
            """Extract bank account number from bank_details string."""
            try:
                if not bank_details:
                    return ""
                banks = json.loads(bank_details)
                if isinstance(banks, list) and len(banks) > 0:
                    return banks[0].get('account_number', '') or ''
            except:
                pass
            return ""

        for r in rows:
            total_gross += r.gross_pay
            total_net += r.net_pay
            
            # Handle both frontend and backend data structures
            cnic = getattr(r, 'cnic', None) or ""
            bank_name = getattr(r, 'bank_name', None) or ""
            bank_account_number = getattr(r, 'bank_account_number', None) or ""
            
            # If bank_name is empty and bank_details exists, extract from it
            if not bank_name and hasattr(r, 'bank_details'):
                bank_name = _get_bank_name_from_details(r.bank_details)
                bank_account_number = _get_bank_account_number_from_details(r.bank_details)
            
            row_data = [
                r.serial_no or "",
                r.fss_no or "",
                (r.name[:16] + "..") if len(r.name) > 18 else r.name,
                cnic,
                getattr(r, "mobile_no", "") or "",
                bank_name,
                bank_account_number,
                _fmt_money(r.base_salary),
                str(r.presents_total),
                str(getattr(r, "paid_leave_days", 0) or 0),
                str(r.total_days),
                str(r.pre_days),
                str(r.cur_days),
                str(r.leave_encashment_days),
                str(r.total_days),
                _fmt_money(r.total_salary),
                _fmt_money(r.overtime_rate),
                str(r.overtime_minutes) + "m",
                _fmt_money(r.overtime_pay),
                _fmt_money(r.allow_other),
                _fmt_money(r.gross_pay),
                r.eobi_no or "",
                "#",
                _fmt_money(r.eobi),
                _fmt_money(r.tax),
                _fmt_money(r.fine_deduction),
                _fmt_money(r.fine_adv),
                _fmt_money(r.net_pay),
                (r.remarks or "")[:16],
                (r.bank_cash or "")[:10],
            ]

            # Prevent long strings from overflowing into adjacent columns.
            row_data[1] = _truncate(str(row_data[1]), 18)   # FSS No.
            row_data[2] = _truncate(str(row_data[2]), 26)   # Employee Name
            row_data[3] = _truncate(str(row_data[3]), 22)   # CNIC
            row_data[4] = _truncate(str(row_data[4]), 18)   # Mobile
            row_data[5] = _truncate(str(row_data[5]), 20)   # Bank Name
            row_data[6] = _truncate(str(row_data[6]), 24)   # Bank Account
            row_data[21] = _truncate(str(row_data[21]), 16) # EOBI #
            row_data[28] = _truncate(str(row_data[28]), 22) # Remarks
            row_data[29] = _truncate(str(row_data[29]), 18) # Bank/Cash
            
            for i, val in enumerate(row_data):
                align = "L" if i in [1, 2, 3, 4, 5, 6, 21, 28, 29] else "R"
                pdf.cell(col_widths[i], 4.5, val, border=1, align=align)
            pdf.ln()
        
        # Totals row with larger font
        pdf.set_font("Helvetica", "B", 6)
        # Align totals under Gross Salary (index 20) and Net Payable (index 27)
        pdf.cell(sum(col_widths[:20]), 5, "TOTALS:", border=1, align="R")
        pdf.cell(col_widths[20], 5, _fmt_money(total_gross), border=1, align="R")
        pdf.cell(sum(col_widths[21:27]), 5, "", border=1)
        pdf.cell(col_widths[27], 5, _fmt_money(total_net), border=1, align="R")
        pdf.cell(sum(col_widths[28:]), 5, "", border=1)
        pdf.ln()
        
        # Summary
        pdf.ln(2)
        pdf.set_font("Helvetica", "", 7)
        pdf.cell(0, 4, f"Total Employees: {len(rows)}  |  Total Gross: Rs {_fmt_money(total_gross)}  |  Total Net: Rs {_fmt_money(total_net)}", ln=True)
        
        # Output
        pdf_bytes = pdf.output()
        
        return Response(
            content=bytes(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename=payroll2_{month}.pdf'}
        )
    
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}\n{error_detail}")
