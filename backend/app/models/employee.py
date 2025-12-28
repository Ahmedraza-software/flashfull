from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Employee(Base):
    """Employee model."""
    
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(100), unique=True, index=True, nullable=False)
    first_name = Column(Text, nullable=False)
    last_name = Column(Text, nullable=False)
    gender = Column(Text)
    date_of_birth = Column(Text)
    profile_photo = Column(Text)  # Store as base64 or URL
    government_id = Column(Text)
    cnic = Column(Text)
    cnic_expiry_date = Column(Text)
    domicile = Column(Text)
    languages_spoken = Column(Text)  # JSON array string
    languages_proficiency = Column(Text)  # JSON array of {language, level}
    height_cm = Column(Integer)
    email = Column(String(100), unique=True, index=True)
    mobile_number = Column(Text)
    personal_phone_number = Column(Text)
    emergency_contact_name = Column(Text)
    emergency_contact_number = Column(Text)
    father_name = Column(Text)
    previous_employment = Column(Text)
    next_of_kin_name = Column(Text)
    next_of_kin_cnic = Column(Text)
    next_of_kin_mobile_number = Column(Text)
    permanent_address = Column(Text)
    temporary_address = Column(Text)

    permanent_village = Column(Text)
    permanent_post_office = Column(Text)
    permanent_thana = Column(Text)
    permanent_tehsil = Column(Text)
    permanent_district = Column(Text)

    present_village = Column(Text)
    present_post_office = Column(Text)
    present_thana = Column(Text)
    present_tehsil = Column(Text)
    present_district = Column(Text)

    city = Column(Text)
    state = Column(Text)
    postal_code = Column(Text)
    department = Column(Text)
    designation = Column(Text)
    enrolled_as = Column(Text)
    employment_type = Column(Text)
    shift_type = Column(Text)
    reporting_manager = Column(Text)
    base_location = Column(Text)
    interviewed_by = Column(Text)
    introduced_by = Column(Text)
    security_clearance = Column(Text)
    basic_security_training = Column(Boolean, default=False)
    fire_safety_training = Column(Boolean, default=False)
    first_aid_certification = Column(Boolean, default=False)
    agreement = Column(Boolean, default=False)
    police_clearance = Column(Boolean, default=False)
    fingerprint_check = Column(Boolean, default=False)
    background_screening = Column(Boolean, default=False)
    reference_verification = Column(Boolean, default=False)
    guard_card = Column(Boolean, default=False)
    guard_card_doc = Column(Text)
    police_clearance_doc = Column(Text)
    fingerprint_check_doc = Column(Text)
    background_screening_doc = Column(Text)
    reference_verification_doc = Column(Text)
    other_certificates = Column(Text)  # JSON string
    basic_salary = Column(Text)
    allowances = Column(Text)
    total_salary = Column(Text)
    bank_name = Column(Text)
    account_number = Column(Text)
    ifsc_code = Column(Text)
    account_type = Column(Text)
    tax_id = Column(Text)
    bank_accounts = Column(Text)  # JSON array string
    system_access_rights = Column(Text)
    employment_status = Column(Text, default="Active")
    last_site_assigned = Column(Text)
    remarks = Column(Text)

    retired_from = Column(Text)  # JSON array string
    service_unit = Column(Text)
    service_rank = Column(Text)
    service_enrollment_date = Column(Text)
    service_reenrollment_date = Column(Text)
    medical_category = Column(Text)
    discharge_cause = Column(Text)

    blood_group = Column(Text)
    civil_education_type = Column(Text)
    civil_education_detail = Column(Text)

    sons_names = Column(Text)
    daughters_names = Column(Text)
    brothers_names = Column(Text)
    sisters_names = Column(Text)

    particulars_verified_by_sho_on = Column(Text)
    particulars_verified_by_ssp_on = Column(Text)
    police_khidmat_verification_on = Column(Text)
    verified_by_khidmat_markaz = Column(Text)

    signature_recording_officer = Column(Text)
    signature_individual = Column(Text)
    fss_number = Column(Text)
    fss_name = Column(Text)
    fss_so = Column(Text)

    original_doc_held = Column(Text)
    documents_handed_over_to = Column(Text)
    photo_on_document = Column(Text)
    eobi_no = Column(Text)
    insurance = Column(Text)
    social_security = Column(Text)
    home_contact_no = Column(Text)
    police_training_letter_date = Column(Text)
    vaccination_certificate = Column(Text)
    volume_no = Column(Text)
    payments = Column(Text)
    fingerprint_attested_by = Column(Text)
    date_of_entry = Column(Text)
    card_number = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Employee {self.employee_id}>"
