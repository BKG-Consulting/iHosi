-- CreateEnum for consent types
CREATE TYPE "ConsentType" AS ENUM (
  'HIPAA_PRIVACY',
  'TREATMENT', 
  'PAYMENT',
  'OPERATIONS',
  'MARKETING',
  'RESEARCH',
  'DIRECTORY_LISTING',
  'EMERGENCY_CONTACT',
  'TELEMEDICINE',
  'DATA_SHARING'
);

-- CreateEnum for consent status
CREATE TYPE "ConsentStatus" AS ENUM (
  'GRANTED',
  'DENIED', 
  'REVOKED',
  'EXPIRED',
  'PENDING'
);

-- CreateTable for patient consent records
CREATE TABLE "PatientConsent" (
    "id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "consent_type" "ConsentType" NOT NULL,
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
    "purpose_of_use" TEXT NOT NULL DEFAULT '[]',
    "data_categories" TEXT NOT NULL DEFAULT '[]',
    "restrictions" TEXT NOT NULL DEFAULT '[]',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable for session management
CREATE TABLE "UserSession" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "logout_reason" TEXT,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable for failed login attempts
CREATE TABLE "LoginAttempt" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "user_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failure_reason" TEXT,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable for user lockouts
CREATE TABLE "UserLockout" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "ip_address" TEXT NOT NULL,
    "locked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlock_at" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserLockout_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "PatientConsent" ADD CONSTRAINT "PatientConsent_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "PatientConsent_patient_id_idx" ON "PatientConsent"("patient_id");
CREATE INDEX "PatientConsent_consent_type_idx" ON "PatientConsent"("consent_type");
CREATE INDEX "PatientConsent_status_idx" ON "PatientConsent"("status");
CREATE INDEX "PatientConsent_expires_at_idx" ON "PatientConsent"("expires_at");

CREATE UNIQUE INDEX "UserSession_session_token_key" ON "UserSession"("session_token");
CREATE INDEX "UserSession_user_id_idx" ON "UserSession"("user_id");
CREATE INDEX "UserSession_last_activity_idx" ON "UserSession"("last_activity");

CREATE INDEX "LoginAttempt_email_idx" ON "LoginAttempt"("email");
CREATE INDEX "LoginAttempt_ip_address_idx" ON "LoginAttempt"("ip_address");
CREATE INDEX "LoginAttempt_attempted_at_idx" ON "LoginAttempt"("attempted_at");

CREATE INDEX "UserLockout_user_id_idx" ON "UserLockout"("user_id");
CREATE INDEX "UserLockout_email_idx" ON "UserLockout"("email");
CREATE INDEX "UserLockout_ip_address_idx" ON "UserLockout"("ip_address");
CREATE INDEX "UserLockout_unlock_at_idx" ON "UserLockout"("unlock_at");
