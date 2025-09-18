-- AI-Enhanced Scheduling System Database Schema Additions
-- This extends the existing schema with AI-powered features

-- AI Learning and Analytics Tables
CREATE TABLE ai_scheduling_patterns (
    id SERIAL PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    pattern_type TEXT NOT NULL, -- 'PREFERRED_TIMES', 'PATIENT_BEHAVIOR', 'DEMAND_PATTERNS'
    pattern_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (doctor_id) REFERENCES "Doctor"(id) ON DELETE CASCADE
);

CREATE TABLE ai_predictions (
    id SERIAL PRIMARY KEY,
    prediction_type TEXT NOT NULL, -- 'NO_SHOW', 'DEMAND', 'OPTIMAL_TIME', 'CONFLICT_RESOLUTION'
    target_id TEXT NOT NULL, -- doctor_id, patient_id, or appointment_id
    prediction_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    accuracy_score DECIMAL(3,2), -- Updated after actual outcome
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    FOREIGN KEY (target_id) REFERENCES "Doctor"(id) ON DELETE CASCADE
);

CREATE TABLE patient_preferences (
    id SERIAL PRIMARY KEY,
    patient_id TEXT NOT NULL,
    preferred_times JSONB, -- Array of preferred time slots
    preferred_doctors JSONB, -- Array of preferred doctor IDs
    appointment_duration_preference INTEGER DEFAULT 30,
    advance_booking_preference INTEGER DEFAULT 7, -- Days in advance
    communication_preferences JSONB, -- Email, SMS, etc.
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (patient_id) REFERENCES "Patient"(id) ON DELETE CASCADE
);

CREATE TABLE smart_scheduling_rules (
    id SERIAL PRIMARY KEY,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- 'AUTO_RESCHEDULE', 'PRIORITY_BOOST', 'CONFLICT_RESOLUTION'
    conditions JSONB NOT NULL, -- When to apply this rule
    actions JSONB NOT NULL, -- What to do when conditions are met
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scheduling_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    doctor_id TEXT,
    department_id TEXT,
    total_appointments INTEGER DEFAULT 0,
    completed_appointments INTEGER DEFAULT 0,
    cancelled_appointments INTEGER DEFAULT 0,
    no_show_appointments INTEGER DEFAULT 0,
    average_wait_time INTEGER, -- In minutes
    patient_satisfaction_score DECIMAL(3,2),
    utilization_rate DECIMAL(3,2), -- Percentage of working hours used
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (doctor_id) REFERENCES "Doctor"(id) ON DELETE CASCADE
);

-- Enhanced Appointment table with AI features
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(3,2);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS predicted_duration INTEGER;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS no_show_probability DECIMAL(3,2);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS auto_scheduled BOOLEAN DEFAULT false;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS ai_suggestions JSONB;

-- Smart scheduling queue for AI processing
CREATE TABLE scheduling_queue (
    id SERIAL PRIMARY KEY,
    request_type TEXT NOT NULL, -- 'OPTIMIZE', 'RESOLVE_CONFLICT', 'PREDICT_DEMAND'
    request_data JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    result_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- AI model performance tracking
CREATE TABLE ai_model_performance (
    id SERIAL PRIMARY KEY,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    accuracy_score DECIMAL(3,2),
    precision_score DECIMAL(3,2),
    recall_score DECIMAL(3,2),
    f1_score DECIMAL(3,2),
    last_trained_at TIMESTAMP,
    training_data_size INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_patterns_doctor_type ON ai_scheduling_patterns(doctor_id, pattern_type);
CREATE INDEX idx_ai_predictions_type_target ON ai_predictions(prediction_type, target_id);
CREATE INDEX idx_patient_preferences_patient ON patient_preferences(patient_id);
CREATE INDEX idx_scheduling_analytics_date_doctor ON scheduling_analytics(date, doctor_id);
CREATE INDEX idx_scheduling_queue_status_priority ON scheduling_queue(status, priority);
CREATE INDEX idx_appointment_ai_features ON "Appointment"(ai_confidence_score, priority_score);


