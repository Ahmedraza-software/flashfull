

from calendar import monthrange
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from fpdf import FPDF
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.core.database import get_db
from app.models.employee import Employee
from app.models.employee2 import Employee2
from app.models.general_item import GeneralItem
from app.models.general_item_employee_balance import GeneralItemEmployeeBalance
from app.models.restricted_item import RestrictedItem
from app.models.restricted_item_employee_balance import RestrictedItemEmployeeBalance
from app.models.restricted_item_serial_unit import RestrictedItemSerialUnit
from app.models.employee_advance import EmployeeAdvance
from app.models.vehicle_assignment import VehicleAssignment
from app.api.routes.payroll import payroll_report
from app.api.dependencies import require_permission

router = APIRouter(dependencies=[Depends(require_permission("accounts:full"))])

def _parse_month(month: str) -> tuple[date, date]:
    try:
        y_s, m_s = month.split("-", 1)
        y = int(y_s)
        m = int(m_s)
        if not (1 <= m <= 12):
            raise ValueError
    except Exception as e:
        raise HTTPException(status_code=400, detail="month must be in YYYY-MM format") from e

    last_day = monthrange(y, m)[1]
    return date(y, m, 1), date(y, m, last_day)


def _fmt_money(v: float | int | None) -> str:
    try:
        n = float(v or 0)
    except Exception:
        n = 0.0
    return f"{n:,.2f}".replace(",", "")


def _pdf_new() -> FPDF:
    pdf = FPDF(orientation="L", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=12)
    pdf.add_page()
    pdf.set_left_margin(12)
    pdf.set_right_margin(12)
    return pdf


def _pdf_new_portrait() -> FPDF:
    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=12)
    pdf.add_page()
    pdf.set_left_margin(12)
    pdf.set_right_margin(12)
    return pdf


def _pdf_header(pdf: FPDF, *, title: str, subtitle: str) -> None:
    # Premium Header with Color Bar
    pdf.set_fill_color(24, 144, 255)  # Flash Blue
    width = 210 if pdf.def_orientation == 'P' else 297
    pdf.rect(0, 0, width, 22, 'F')
    
    pdf.set_y(6)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "FLASH TECH ERP - OFFICIAL INVENTORY REPORT", 0, 1, "C")
    
    pdf.set_y(26)
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, title, 0, 1, "L")
    
    pdf.set_font("Helvetica", size=8)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(0, 5, f"{subtitle}  |  Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=1)
    
    pdf.set_draw_color(220, 220, 220)
    pdf.line(12, pdf.get_y() + 2, width - 12, pdf.get_y() + 2)
    pdf.ln(4)
    pdf.set_text_color(15, 23, 42)


def _pdf_section_title(pdf: FPDF, title: str) -> None:
    pdf.ln(2)
    pdf.set_font("Helvetica", style="B", size=9)
    pdf.set_fill_color(248, 250, 252)
    pdf.cell(0, 6, "  " + title, ln=1, fill=True)
    pdf.set_font("Helvetica", size=8)


def _pdf_table(pdf: FPDF, headers: list[str], rows: list[list[str]], col_widths: list[float]) -> None:
    pdf.set_fill_color(241, 245, 249)
    pdf.set_draw_color(220, 220, 220)
    pdf.set_font("Helvetica", style="B", size=8)
    for i, h in enumerate(headers):
        pdf.cell(col_widths[i], 7, h, border=1, fill=True, align="C")
    pdf.ln()

    pdf.set_font("Helvetica", size=8)
    for idx, r in enumerate(rows):
        if idx % 2 == 0:
            pdf.set_fill_color(255, 255, 255)
        else:
            pdf.set_fill_color(252, 252, 252)
        for i, v in enumerate(r):
            align = "R" if i >= len(r) - 1 and r[i].replace('.','').isdigit() else "L"
            pdf.cell(col_widths[i], 6, " " + str(v), border=1, fill=True, align=align)
        pdf.ln()


@router.get("/accounts/monthly/pdf")
async def export_accounts_monthly_pdf(
    month: str,
    db: Session = Depends(get_db),
) -> Response:
    start, end = _parse_month(month)
    payroll = await payroll_report(month=month, db=db)

    payroll_due = 0.0
    payroll_paid = 0.0
    payroll_due_rows = []
    payroll_paid_rows = []

    for r in payroll.rows:
        st = str(r.paid_status or "unpaid").strip().lower()
        net = float(r.net_pay or 0.0)
        if st == "paid":
            payroll_paid += net
        else:
            payroll_due += net
        row = [
            str(r.employee_id or ""),
            str(r.name or ""),
            str(r.department or ""),
            str(r.shift_type or ""),
            _fmt_money(float(r.gross_pay or 0.0)),
            _fmt_money(float(getattr(r, "advance_deduction", 0.0) or 0.0)),
            _fmt_money(net),
            "PAID" if st == "paid" else "UNPAID",
        ]
        if st == "paid":
            payroll_paid_rows.append(row)
        else:
            payroll_due_rows.append(row)

    # Legacy employee lookup for advances (if still using old Employee model for some lookups)
    # But let's assume advances and vehicle assignments might need it or were updated.
    # Looking at original imports: from app.models.employee import Employee
    # I should probably import it if needed or use Employee2.
    # Let's check imports - I removed Employee. Let me add it back if it exists.
    from app.models.employee import Employee 

    assignments = (
        db.query(VehicleAssignment)
        .filter(VehicleAssignment.status == "Complete")
        .filter(VehicleAssignment.assignment_date >= start)
        .filter(VehicleAssignment.assignment_date <= end)
        .order_by(VehicleAssignment.assignment_date.asc(), VehicleAssignment.id.asc())
        .all()
    )

    total_km = sum(float(a.distance_km or 0.0) for a in assignments)
    total_amount = sum(float(a.amount or 0.0) for a in assignments)

    assignment_rows = []
    for a in assignments:
        assignment_rows.append([
            str(a.id),
            (a.assignment_date.isoformat() if a.assignment_date else ""),
            str(a.vehicle_id or ""),
            str(a.route_from or ""),
            str(a.route_to or ""),
            _fmt_money(float(a.distance_km or 0.0)),
            _fmt_money(float(a.amount or 0.0)),
        ])

    advances_total_month = db.query(func.coalesce(func.sum(EmployeeAdvance.amount), 0.0)).filter(EmployeeAdvance.advance_date >= start).filter(EmployeeAdvance.advance_date <= end).scalar()
    advances_total_lifetime = db.query(func.coalesce(func.sum(EmployeeAdvance.amount), 0.0)).scalar()

    advances = (
        db.query(EmployeeAdvance, Employee)
        .join(Employee, Employee.id == EmployeeAdvance.employee_db_id)
        .filter(EmployeeAdvance.advance_date >= start)
        .filter(EmployeeAdvance.advance_date <= end)
        .order_by(EmployeeAdvance.advance_date.asc(), EmployeeAdvance.id.asc())
        .all()
    )

    advances_rows = []
    for adv, emp in advances:
        name = " ".join([p for p in [emp.first_name, emp.last_name] if p])
        advances_rows.append([
            (adv.advance_date.isoformat() if adv.advance_date else ""),
            str(emp.employee_id or ""),
            str(name),
            _fmt_money(float(adv.amount or 0.0)),
            str(adv.note or ""),
        ])

    pdf = _pdf_new()
    _pdf_header(pdf, title="Accounts Monthly Export", subtitle=f"Month: {month}")

    _pdf_section_title(pdf, "Summary")
    pdf.set_font("Helvetica", size=9)
    pdf.cell(70, 6, "Payroll Due (Unpaid)")
    pdf.cell(0, 6, f"Rs {_fmt_money(payroll_due)}", ln=1)
    pdf.cell(70, 6, "Payroll Paid")
    pdf.cell(0, 6, f"Rs {_fmt_money(payroll_paid)}", ln=1)
    pdf.cell(70, 6, "Fuel Spend on Assignments")
    pdf.cell(0, 6, f"Rs {_fmt_money(total_amount)}", ln=1)
    pdf.cell(70, 6, "Advances Taken (Month)")
    pdf.cell(0, 6, f"Rs {_fmt_money(float(advances_total_month or 0.0))}", ln=1)

    _pdf_section_title(pdf, f"Payroll Due (Unpaid)  Rs {_fmt_money(payroll_due)}")
    _pdf_table(pdf, ["Emp ID", "Name", "Dept", "Shift", "Gross", "Adv Ded", "Net", "Status"], payroll_due_rows, [20, 46, 28, 22, 20, 20, 20, 18])

    _pdf_section_title(pdf, f"Payroll Paid  Rs {_fmt_money(payroll_paid)}")
    _pdf_table(pdf, ["Emp ID", "Name", "Dept", "Shift", "Gross", "Adv Ded", "Net", "Status"], payroll_paid_rows, [20, 46, 28, 22, 20, 20, 20, 18])

    _pdf_section_title(pdf, f"Advances Taken (Month)  Rs {_fmt_money(float(advances_total_month or 0.0))}")
    _pdf_table(pdf, ["Date", "Emp ID", "Employee", "Amount", "Note"], advances_rows, [24, 24, 60, 22, 120])

    out = pdf.output(dest="S")
    pdf_bytes = bytes(out) if isinstance(out, (bytes, bytearray)) else str(out).encode("latin-1")
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="accounts_export_{month}.pdf"'})


@router.get("/inventory/employees/pdf")
async def export_employee_inventory_pdf(
    include_zero: bool = True,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
) -> Response:
    query = db.query(Employee2)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Employee2.name.ilike(s)) | 
            (Employee2.employee_id.ilike(s)) | 
            (Employee2.fss_no.ilike(s)) |
            (Employee2.serial_no.ilike(s))
        )
    
    employees = query.order_by(Employee2.serial_no.asc()).all()
    pdf = _pdf_new_portrait()
    first_employee = True

    for emp in employees:
        emp_id = str(emp.fss_no or emp.serial_no or emp.id).strip()
        name = str(emp.name or "Unknown")
        
        # Fetch inventory - with name-based fallback for legacy IDs
        # 1. Get legacy IDs if any (matching by name)
        legacy_ids = {emp_id}
        old_emp = db.query(Employee).filter(
            (func.concat(Employee.first_name, " ", Employee.last_name).ilike(name))
        ).first()
        if old_emp:
            legacy_ids.add(str(old_emp.employee_id).strip())

        restricted_serials = (
            db.query(RestrictedItemSerialUnit, RestrictedItem)
            .join(RestrictedItem, RestrictedItem.item_code == RestrictedItemSerialUnit.item_code)
            .filter(RestrictedItemSerialUnit.issued_to_employee_id.in_(list(legacy_ids)))
            .all()
        )
        r_serial_data = [[it.item_code, it.name, su.serial_number, str(su.status).title(), (su.updated_at.strftime("%Y-%m-%d") if su.updated_at else "-")] for su, it in restricted_serials]

        restricted_qty = db.query(RestrictedItemEmployeeBalance, RestrictedItem).join(RestrictedItem, RestrictedItem.item_code == RestrictedItemEmployeeBalance.item_code).filter(RestrictedItemEmployeeBalance.employee_id.in_(list(legacy_ids)), RestrictedItemEmployeeBalance.quantity_issued > 0).all()
        r_qty_data = [[it.item_code, it.name, it.unit_name, _fmt_money(bal.quantity_issued)] for bal, it in restricted_qty]

        general_qty = db.query(GeneralItemEmployeeBalance, GeneralItem).join(GeneralItem, GeneralItem.item_code == GeneralItemEmployeeBalance.item_code).filter(GeneralItemEmployeeBalance.employee_id.in_(list(legacy_ids)), GeneralItemEmployeeBalance.quantity_issued > 0).all()
        g_qty_data = [[it.item_code, it.name, it.unit_name, _fmt_money(bal.quantity_issued)] for bal, it in general_qty]

        total = len(r_serial_data) + len(r_qty_data) + len(g_qty_data)
        if not include_zero and total == 0:
            continue

        if not first_employee:
            pdf.add_page()
        _pdf_header(pdf, title="Employee Inventory Report", subtitle=f"Staff: {name} ({emp_id})")
        first_employee = False

        if r_serial_data:
            _pdf_section_title(pdf, "WEAPONS & SERIALIZED EQUIPMENT")
            _pdf_table(pdf, ["Code", "Item Name", "Serial #", "Status", "Date"], r_serial_data, [25, 65, 40, 26, 30])
        
        if r_qty_data:
            _pdf_section_title(pdf, "AMMUNITION & RESTRICTED CONSUMABLES")
            _pdf_table(pdf, ["Code", "Item Name", "Unit", "Quantity"], r_qty_data, [30, 100, 26, 30])

        if g_qty_data:
            _pdf_section_title(pdf, "GENERAL STORE & UTILITY ITEMS")
            _pdf_table(pdf, ["Code", "Item Name", "Unit", "Quantity"], g_qty_data, [30, 100, 26, 30])
        
        if total == 0:
            pdf.ln(5)
            pdf.set_font("Helvetica", "I", 9)
            pdf.cell(0, 10, "No inventory items recorded for this employee.", ln=1)

    out = pdf.output(dest="S")
    pdf_bytes = bytes(out) if isinstance(out, (bytes, bytearray)) else str(out).encode("latin-1")
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="all_inventory_{datetime.now().strftime("%Y%m%d")}.pdf"'})


@router.get("/inventory/employee/{employee_id}/pdf")
async def export_single_employee_inventory_pdf(
    employee_id: str,
    db: Session = Depends(get_db),
) -> Response:
    emp = db.query(Employee2).filter((Employee2.fss_no == employee_id) | (Employee2.serial_no == employee_id) | (Employee2.id == (int(employee_id) if employee_id.isdigit() else -1))).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    emp_id = str(emp.fss_no or emp.serial_no or emp.id).strip()
    name = str(emp.name or "Unknown")

    pdf = _pdf_new_portrait()
    _pdf_header(pdf, title="Individual Staff Inventory", subtitle=f"Staff: {name} (ID: {emp_id})")

    # Fetch inventory - with name-based fallback for legacy IDs
    legacy_ids = {emp_id}
    old_emp = db.query(Employee).filter(
        (func.concat(Employee.first_name, " ", Employee.last_name).ilike(name))
    ).first()
    if old_emp:
        legacy_ids.add(str(old_emp.employee_id).strip())

    restricted_serials = (
        db.query(RestrictedItemSerialUnit, RestrictedItem)
        .join(RestrictedItem, RestrictedItem.item_code == RestrictedItemSerialUnit.item_code)
        .filter(RestrictedItemSerialUnit.issued_to_employee_id.in_(list(legacy_ids)))
        .all()
    )
    r_serial_data = [[it.item_code, it.name, su.serial_number, str(su.status).title(), (su.updated_at.strftime("%Y-%m-%d") if su.updated_at else "-")] for su, it in restricted_serials]

    restricted_qty = db.query(RestrictedItemEmployeeBalance, RestrictedItem).join(RestrictedItem, RestrictedItem.item_code == RestrictedItemEmployeeBalance.item_code).filter(RestrictedItemEmployeeBalance.employee_id.in_(list(legacy_ids)), RestrictedItemEmployeeBalance.quantity_issued > 0).all()
    r_qty_data = [[it.item_code, it.name, it.unit_name, _fmt_money(bal.quantity_issued)] for bal, it in restricted_qty]

    general_qty = db.query(GeneralItemEmployeeBalance, GeneralItem).join(GeneralItem, GeneralItem.item_code == GeneralItemEmployeeBalance.item_code).filter(GeneralItemEmployeeBalance.employee_id.in_(list(legacy_ids)), GeneralItemEmployeeBalance.quantity_issued > 0).all()
    g_qty_data = [[it.item_code, it.name, it.unit_name, _fmt_money(bal.quantity_issued)] for bal, it in general_qty]

    if r_serial_data:
        _pdf_section_title(pdf, "WEAPONS & SERIALIZED EQUIPMENT")
        _pdf_table(pdf, ["Code", "Item Name", "Serial #", "Status", "Date"], r_serial_data, [25, 65, 40, 26, 30])
    
    if r_qty_data:
        _pdf_section_title(pdf, "AMMUNITION & RESTRICTED CONSUMABLES")
        _pdf_table(pdf, ["Code", "Item Name", "Unit", "Quantity"], r_qty_data, [30, 100, 26, 30])

    if g_qty_data:
        _pdf_section_title(pdf, "GENERAL STORE & UTILITY ITEMS")
        _pdf_table(pdf, ["Code", "Item Name", "Unit", "Quantity"], g_qty_data, [30, 100, 26, 30])

    if not (r_serial_data or r_qty_data or g_qty_data):
        pdf.ln(5)
        pdf.set_font("Helvetica", "I", 10)
        pdf.cell(0, 10, "No inventory items found.", ln=1)

    out = pdf.output(dest="S")
    pdf_bytes = bytes(out) if isinstance(out, (bytes, bytearray)) else str(out).encode("latin-1")
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="inventory_{emp_id}.pdf"'})
