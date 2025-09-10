-- Additional tables for complete clinical workflow

-- Pre-appointment questionnaires
CREATE TABLE "PreAppointmentQuestionnaire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointment_id" INTEGER NOT NULL,
    "patient_id" TEXT NOT NULL,
    "chief_complaint" TEXT,
    "history_present_illness" TEXT,
    "current_medications" JSONB,
    "allergies" JSONB,
    "family_history" TEXT,
    "social_history" TEXT,
    "review_of_systems" JSONB,
    "pain_scale" INTEGER,
    "symptoms_duration" TEXT,
    "severity" TEXT,
    "triggers" TEXT,
    "relieving_factors" TEXT,
    "associated_symptoms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE,
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE
);

-- Enhanced medication tracking
CREATE TABLE "PatientMedication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "prescribing_doctor" TEXT,
    "pharmacy" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE
);

-- Family history
CREATE TABLE "FamilyHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "age_of_onset" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE
);

-- Enhanced allergy tracking
CREATE TABLE "PatientAllergy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_id" TEXT NOT NULL,
    "allergen_type" TEXT NOT NULL, -- 'drug', 'food', 'environmental', 'other'
    "allergen_name" TEXT NOT NULL,
    "severity" TEXT NOT NULL, -- 'mild', 'moderate', 'severe', 'life-threatening'
    "reaction" TEXT NOT NULL,
    "onset_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE
);

-- Nursing assessment
CREATE TABLE "NursingAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointment_id" INTEGER NOT NULL,
    "patient_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "chief_complaint" TEXT,
    "vital_signs_id" INTEGER,
    "pain_assessment" JSONB,
    "medication_reconciliation" JSONB,
    "allergy_verification" JSONB,
    "pre_consultation_notes" TEXT,
    "assessment_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE,
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE,
    FOREIGN KEY ("vital_signs_id") REFERENCES "VitalSigns"("id") ON DELETE SET NULL
);

-- Clinical orders
CREATE TABLE "ClinicalOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointment_id" INTEGER NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "order_type" TEXT NOT NULL, -- 'lab', 'imaging', 'medication', 'referral', 'procedure'
    "order_name" TEXT NOT NULL,
    "order_details" JSONB,
    "priority" TEXT DEFAULT 'routine', -- 'stat', 'urgent', 'routine'
    "status" TEXT DEFAULT 'pending', -- 'pending', 'ordered', 'completed', 'cancelled'
    "external_system_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE,
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE,
    FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE
);

-- Prescriptions
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointment_id" INTEGER NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT,
    "quantity" INTEGER,
    "refills" INTEGER DEFAULT 0,
    "instructions" TEXT,
    "pharmacy_id" TEXT,
    "status" TEXT DEFAULT 'pending', -- 'pending', 'sent', 'filled', 'cancelled'
    "external_prescription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE,
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE,
    FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE
);

-- SOAP notes
CREATE TABLE "SOAPNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointment_id" INTEGER NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "subjective" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "icd10_codes" TEXT[],
    "cpt_codes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE,
    FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE,
    FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX "PreAppointmentQuestionnaire_appointment_id_idx" ON "PreAppointmentQuestionnaire"("appointment_id");
CREATE INDEX "PreAppointmentQuestionnaire_patient_id_idx" ON "PreAppointmentQuestionnaire"("patient_id");
CREATE INDEX "PatientMedication_patient_id_idx" ON "PatientMedication"("patient_id");
CREATE INDEX "PatientMedication_is_active_idx" ON "PatientMedication"("is_active");
CREATE INDEX "FamilyHistory_patient_id_idx" ON "FamilyHistory"("patient_id");
CREATE INDEX "PatientAllergy_patient_id_idx" ON "PatientAllergy"("patient_id");
CREATE INDEX "NursingAssessment_appointment_id_idx" ON "NursingAssessment"("appointment_id");
CREATE INDEX "ClinicalOrder_appointment_id_idx" ON "ClinicalOrder"("appointment_id");
CREATE INDEX "ClinicalOrder_status_idx" ON "ClinicalOrder"("status");
CREATE INDEX "Prescription_appointment_id_idx" ON "Prescription"("appointment_id");
CREATE INDEX "Prescription_status_idx" ON "Prescription"("status");
CREATE INDEX "SOAPNote_appointment_id_idx" ON "SOAPNote"("appointment_id");

