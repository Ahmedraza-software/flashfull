"""Employee2 model - simplified employee records from legacy data."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Employee2(Base):
    """Employee2 model for legacy staff data."""
    
    __tablename__ = "employees2"
    
    id = Column(Integer, primary_key=True, index=True)
    serial_no = Column(String(100), index=True)  # A - #
    fss_no = Column(String(100), index=True)  # B - FSS #
    rank = Column(Text)  # C - Rank
    name = Column(Text, nullable=False)  # D - Name
    father_name = Column(Text)  # E - Father's Name
    salary = Column(Text)  # F - Salary
    status = Column(Text)  # G - Status (Army/Civil/PAF etc)
    unit = Column(Text)  # H - Unit
    service_rank = Column(Text)  # I - Rank (service)
    blood_group = Column(Text)  # J - Blood Gp
    status2 = Column(Text)  # K - Status (second)
    unit2 = Column(Text)  # L - Unit (second)
    rank2 = Column(Text)  # M - Rank (third)
    cnic = Column(String(100), index=True)  # N - CNIC #
    dob = Column(Text)  # O - DOB
    cnic_expiry = Column(Text)  # P - CNIC Expr
    documents_held = Column(Text)  # Q - Documents held
    documents_handed_over_to = Column(Text)  # R - Documents Reciving /Handed Over To
    photo_on_doc = Column(Text)  # S - Photo on Docu
    eobi_no = Column(Text)  # T - EOBI #
    insurance = Column(Text)  # W - Insurance
    social_security = Column(Text)  # X - Social Security
    mobile_no = Column(Text)  # Y - Mob #
    home_contact = Column(Text)  # Z - Home Contact Number
    verified_by_sho = Column(Text)  # AA - Verified by SHO
    verified_by_khidmat_markaz = Column(Text)  # AB - Verified by Khidmat Markaz
    domicile = Column(Text)  # AC - Domicile
    verified_by_ssp = Column(Text)  # AD - Verified by SSP
    enrolled = Column(Text)  # AE - Enrolled
    re_enrolled = Column(Text)  # AF - Re Enrolled
    village = Column(Text)  # AG - Village
    post_office = Column(Text)  # AH - Post Office
    thana = Column(Text)  # AI - Thana
    tehsil = Column(Text)  # AJ - Tehsil
    district = Column(Text)  # AK - District
    duty_location = Column(Text)  # AL - Duty Location
    police_trg_ltr_date = Column(Text)  # AM - Police Trg Ltr & Date
    vaccination_cert = Column(Text)  # AN - Vacanation Cert
    vol_no = Column(Text)  # AO - Vol #
    payments = Column(Text)  # AP - Payment's
    category = Column(Text)  # Category (Office Staff, Operational Staff, etc.)
    designation = Column(Text)  # Job designation
    allocation_status = Column(Text, default="Free")  # Free / Allocated
    
    # Avatar and document attachments
    avatar_url = Column(Text)  # Profile picture URL
    cnic_attachment = Column(Text)  # CNIC document URL
    domicile_attachment = Column(Text)  # Domicile document URL
    sho_verified_attachment = Column(Text)  # SHO verification document URL
    ssp_verified_attachment = Column(Text)  # SSP verification document URL
    khidmat_verified_attachment = Column(Text)  # Khidmat Markaz verification document URL
    police_trg_attachment = Column(Text)  # Police training document URL
    
    # Bank accounts stored as JSON string
    bank_accounts = Column(Text)  # JSON array of bank accounts
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Employee2 {self.serial_no} - {self.name}>"
