-- Enhanced Granular Consent Management System

-- Data categories for granular consent
CREATE TYPE "DataCategory" AS ENUM (
  'DEMOGRAPHICS',
  'CONTACT_INFO',
  'MEDICAL_HISTORY',
  'ALLERGIES',
  'MEDICATIONS',
  'VITAL_SIGNS',
  'LAB_RESULTS',
  'IMAGING_RESULTS',
  'DIAGNOSES',
  'TREATMENT_PLANS',
  'PRESCRIPTIONS',
  'BILLING_INFO',
  'INSURANCE_INFO',
  'EMERGENCY_CONTACTS',
  'FAMILY_HISTORY',
  'SOCIAL_HISTORY',
  'MENTAL_HEALTH',
  'SUBSTANCE_USE',
  'SEXUAL_HEALTH',
  'GENETIC_INFO'
);

-- Medical action types requiring specific consent
CREATE TYPE "MedicalActionType" AS ENUM (
  'VIEW_MEDICAL_RECORDS',
  'WRITE_DIAGNOSIS',
  'PRESCRIBE_MEDICATION',
  'ORDER_LAB_TESTS',
  'ORDER_IMAGING',
  'REFER_TO_SPECIALIST',
  'SHARE_WITH_OTHER_DOCTORS',
  'USE_FOR_RESEARCH',
  'MARKETING_COMMUNICATIONS',
  'EMERGENCY_ACCESS'
);

-- Granular consent records
CREATE TABLE "GranularConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT, -- Specific doctor consent
    "consent_type" "ConsentType" NOT NULL,
    "data_categories" "DataCategory"[] NOT NULL,
    "medical_actions" "MedicalActionType"[] NOT NULL,
    "status" "ConsentStatus" NOT NULL,
    "consent_text" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "granted_by" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "digital_signature" TEXT,
    "witness_id" TEXT,
    "legal_basis" TEXT NOT NULL,
    "purpose_of_use" TEXT[] NOT NULL DEFAULT '{}',
    "restrictions" TEXT[] NOT NULL DEFAULT '{}',
    "auto_revoke_after_appointment" BOOLEAN DEFAULT false,
    "auto_revoke_days" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE,
    FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE
);

-- Consent workflow tracking
CREATE TABLE "ConsentWorkflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "appointment_id" INTEGER,
    "workflow_type" TEXT NOT NULL, -- 'appointment_consent', 'treatment_consent', 'data_sharing_consent'
    "status" TEXT NOT NULL, -- 'pending', 'completed', 'expired', 'cancelled'
    "required_consents" TEXT[] NOT NULL,
    "granted_consents" TEXT[] NOT NULL DEFAULT '{}',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE,
    FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE
);

-- Consent access logs for audit
CREATE TABLE "ConsentAccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "consent_id" TEXT NOT NULL,
    "access_type" TEXT NOT NULL, -- 'view', 'create', 'update', 'delete'
    "data_category" "DataCategory" NOT NULL,
    "medical_action" "MedicalActionType",
    "access_reason" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,
    "denial_reason" TEXT,
    
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE,
    FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE,
    FOREIGN KEY ("consent_id") REFERENCES "GranularConsent"("id") ON DELETE CASCADE
);

-- Patient consent preferences
CREATE TABLE "PatientConsentPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL UNIQUE,
    "default_consent_duration_days" INTEGER DEFAULT 365,
    "auto_revoke_after_appointment" BOOLEAN DEFAULT true,
    "allow_emergency_access" BOOLEAN DEFAULT true,
    "allow_research_use" BOOLEAN DEFAULT false,
    "allow_marketing" BOOLEAN DEFAULT false,
    "preferred_consent_method" TEXT DEFAULT 'digital', -- 'digital', 'paper', 'verbal'
    "consent_notification_preferences" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE
);

-- Doctor-patient consent relationships
CREATE TABLE "DoctorPatientConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "consent_granted_at" TIMESTAMP(3) NOT NULL,
    "consent_expires_at" TIMESTAMP(3),
    "status" TEXT NOT NULL, -- 'active', 'expired', 'revoked'
    "data_categories_allowed" "DataCategory"[] NOT NULL,
    "medical_actions_allowed" "MedicalActionType"[] NOT NULL,
    "restrictions" TEXT[] NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE,
    FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE,
    UNIQUE("patient_id", "doctor_id")
);

-- Indexes for performance
CREATE INDEX "GranularConsent_patient_id_idx" ON "GranularConsent"("patient_id");
CREATE INDEX "GranularConsent_doctor_id_idx" ON "GranularConsent"("doctor_id");
CREATE INDEX "GranularConsent_status_idx" ON "GranularConsent"("status");
CREATE INDEX "GranularConsent_expires_at_idx" ON "GranularConsent"("expires_at");
CREATE INDEX "ConsentWorkflow_patient_id_idx" ON "ConsentWorkflow"("patient_id");
CREATE INDEX "ConsentWorkflow_appointment_id_idx" ON "ConsentWorkflow"("appointment_id");
CREATE INDEX "ConsentAccessLog_patient_id_idx" ON "ConsentAccessLog"("patient_id");
CREATE INDEX "ConsentAccessLog_doctor_id_idx" ON "ConsentAccessLog"("doctor_id");
CREATE INDEX "ConsentAccessLog_timestamp_idx" ON "ConsentAccessLog"("timestamp");
CREATE INDEX "DoctorPatientConsent_patient_id_idx" ON "DoctorPatientConsent"("patient_id");
CREATE INDEX "DoctorPatientConsent_doctor_id_idx" ON "DoctorPatientConsent"("doctor_id");
CREATE INDEX "DoctorPatientConsent_status_idx" ON "DoctorPatientConsent"("status");

