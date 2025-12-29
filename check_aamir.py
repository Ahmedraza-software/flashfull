import sys, os
sys.path.insert(0, 'backend')
from datetime import date
from sqlalchemy.orm import SessionLocal
from app.models.employee2 import Employee2
from app.models.attendance import AttendanceRecord

def norm(st, lt):
    st = (st or '').strip().lower()
    lt = (lt or '').strip().lower() or None
    if st in ('', '-', 'unmarked'): return ('unmarked', None)
    if st.startswith('leave'):
        if lt is None:
            if 'unpaid' in st: lt = 'unpaid'
            elif 'paid' in st: lt = 'paid'
        return ('leave', lt)
    if st in ('present', 'late', 'absent'): return (st, None)
    return (st, lt)

s = SessionLocal()
try:
    emp = s.query(Employee2).filter(Employee2.name.ilike('%Aamir Saleem Jan%')).first()
    if not emp:
        print('Employee not found')
        sys.exit(1)
    emp_id = str(getattr(emp, 'fss_no', None) or getattr(emp, 'serial_no', None) or emp.id).strip()
    start, end = date(2025,12,1), date(2025,12,29)
    rows = s.query(AttendanceRecord).filter(AttendanceRecord.employee_id==emp_id, AttendanceRecord.date>=start, AttendanceRecord.date<=end).all()
    present=late=absent=paid_leave=unpaid_leave=unmarked=0
    for r in rows:
        st, lt = norm(r.status, r.leave_type)
        if st=='present': present+=1
        elif st=='late': late+=1
        elif st=='absent': absent+=1
        elif st=='leave':
            if (lt or '')=='unpaid': unpaid_leave+=1
            else: paid_leave+=1
        else: unmarked+=1
    presents_total = present + late + paid_leave
    working_days = (end - start).days + 1
    base_salary = float(emp.salary or 0)
    day_rate = base_salary / working_days if working_days else 0
    total_days = presents_total
    total_salary = total_days * day_rate
    print('=== Direct DB counts (with normalization) ===')
    print('Employee:', emp.name, 'ID used for lookup:', emp_id)
    print('Attendance counts:', {'present':present,'late':late,'absent':absent,'paid_leave':paid_leave,'unpaid_leave':unpaid_leave,'unmarked':unmarked})
    print('presents_total (paid days):', presents_total)
    print('working_days:', working_days, 'base_salary:', base_salary, 'day_rate:', round(day_rate,2))
    print('total_days (used for salary):', total_days, '=> total_salary:', round(total_salary,2))
finally:
    s.close()
