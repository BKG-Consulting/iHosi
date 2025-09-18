-- Security enhancements for authentication system
-- Run this after the main schema migration

-- MFA table for TOTP secrets and backup codes
CREATE TABLE IF NOT EXISTS user_mfa (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    secret VARCHAR(255) NOT NULL,
    backup_codes TEXT[], -- Array of backup codes
    is_enabled BOOLEAN DEFAULT FALSE,
    enabled_at TIMESTAMP,
    disabled_at TIMESTAMP,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens table for token rotation
CREATE TABLE IF NOT EXISTS refresh_token (
    id SERIAL PRIMARY KEY,
    token_id VARCHAR(255) NOT NULL UNIQUE, -- Family ID for token rotation
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMP,
    revoked_reason VARCHAR(255),
    parent_token_id VARCHAR(255), -- For token rotation tracking
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limit (
    id SERIAL PRIMARY KEY,
    rate_limit_key VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    pathname VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_mfa_user_id ON user_mfa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_enabled ON user_mfa(is_enabled);

CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_token(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_token_id ON refresh_token(token_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_active ON refresh_token(is_active);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expires ON refresh_token(expires_at);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON rate_limit(rate_limit_key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON rate_limit(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limit_created ON rate_limit(created_at);

-- Add MFA enabled column to user tables if not exists
ALTER TABLE patient ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE doctor ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;

-- Add indexes for MFA columns
CREATE INDEX IF NOT EXISTS idx_patient_mfa ON patient(mfa_enabled);
CREATE INDEX IF NOT EXISTS idx_doctor_mfa ON doctor(mfa_enabled);
CREATE INDEX IF NOT EXISTS idx_staff_mfa ON staff(mfa_enabled);


