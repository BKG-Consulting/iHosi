-- Robust Scheduling System Schema Additions
-- This extends the current WorkingDays model with comprehensive scheduling capabilities

-- Enhanced WorkingDays with recurrence patterns
ALTER TABLE "WorkingDays" ADD COLUMN "recurrence_type" TEXT DEFAULT 'WEEKLY';
ALTER TABLE "WorkingDays" ADD COLUMN "recurrence_pattern" JSONB; -- For complex patterns
ALTER TABLE "WorkingDays" ADD COLUMN "effective_from" TIMESTAMP;
ALTER TABLE "WorkingDays" ADD COLUMN "effective_until" TIMESTAMP;
ALTER TABLE "WorkingDays" ADD COLUMN "timezone" TEXT DEFAULT 'UTC';
ALTER TABLE "WorkingDays" ADD COLUMN "appointment_duration" INTEGER DEFAULT 30;
ALTER TABLE "WorkingDays" ADD COLUMN "buffer_time" INTEGER DEFAULT 5;
ALTER TABLE "WorkingDays" ADD COLUMN "is_template" BOOLEAN DEFAULT false;

-- Schedule Templates for different patterns
CREATE TABLE "ScheduleTemplates" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "template_type" TEXT NOT NULL, -- 'WEEKLY', 'MONTHLY', 'CUSTOM'
  "is_default" BOOLEAN DEFAULT false,
  "working_days" JSONB NOT NULL, -- Array of working day configurations
  "recurrence_rules" JSONB, -- Complex recurrence patterns
  "timezone" TEXT DEFAULT 'UTC',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE
);

-- Schedule Exceptions for holidays, vacations, special days
CREATE TABLE "ScheduleExceptions" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" TEXT NOT NULL,
  "exception_type" TEXT NOT NULL, -- 'HOLIDAY', 'VACATION', 'SICK_LEAVE', 'EMERGENCY', 'CUSTOM'
  "title" TEXT NOT NULL,
  "description" TEXT,
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP NOT NULL,
  "is_all_day" BOOLEAN DEFAULT true,
  "start_time" TEXT, -- Only if not all day
  "end_time" TEXT,   -- Only if not all day
  "is_recurring" BOOLEAN DEFAULT false,
  "recurrence_pattern" JSONB, -- For recurring exceptions
  "affects_appointments" BOOLEAN DEFAULT true, -- Whether to cancel/reschedule appointments
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE
);

-- Calendar Integration for external calendar sync
CREATE TABLE "CalendarIntegrations" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" TEXT NOT NULL,
  "provider" TEXT NOT NULL, -- 'GOOGLE', 'OUTLOOK', 'APPLE', 'CUSTOM'
  "provider_id" TEXT NOT NULL,
  "calendar_id" TEXT NOT NULL,
  "sync_enabled" BOOLEAN DEFAULT true,
  "sync_direction" TEXT DEFAULT 'BIDIRECTIONAL', -- 'INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'
  "last_sync" TIMESTAMP,
  "sync_token" TEXT,
  "credentials" JSONB, -- Encrypted credentials
  "settings" JSONB, -- Sync settings and filters
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE,
  UNIQUE("doctor_id", "provider", "calendar_id")
);

-- Schedule Conflicts and Resolutions
CREATE TABLE "ScheduleConflicts" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" TEXT NOT NULL,
  "conflict_type" TEXT NOT NULL, -- 'DOUBLE_BOOKING', 'OVERLAP', 'EXCEPTION_VIOLATION', 'CALENDAR_SYNC'
  "appointment_id" INTEGER,
  "conflicting_appointment_id" INTEGER,
  "conflict_start" TIMESTAMP NOT NULL,
  "conflict_end" TIMESTAMP NOT NULL,
  "severity" TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  "status" TEXT DEFAULT 'PENDING', -- 'PENDING', 'RESOLVED', 'IGNORED'
  "resolution_method" TEXT, -- 'AUTO_RESCHEDULE', 'MANUAL_RESOLUTION', 'CANCEL_APPOINTMENT'
  "resolution_notes" TEXT,
  "resolved_at" TIMESTAMP,
  "resolved_by" TEXT, -- User ID who resolved
  "created_at" TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE,
  FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE,
  FOREIGN KEY ("conflicting_appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE
);

-- Schedule Analytics for AI optimization
CREATE TABLE "ScheduleAnalytics" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "total_appointments" INTEGER DEFAULT 0,
  "completed_appointments" INTEGER DEFAULT 0,
  "cancelled_appointments" INTEGER DEFAULT 0,
  "no_show_appointments" INTEGER DEFAULT 0,
  "average_appointment_duration" FLOAT,
  "utilization_rate" FLOAT, -- Percentage of available time used
  "patient_satisfaction_score" FLOAT,
  "ai_optimization_score" FLOAT,
  "peak_hours" JSONB, -- Array of peak hours
  "low_utilization_hours" JSONB, -- Array of low utilization hours
  "recommendations" JSONB, -- AI-generated recommendations
  "created_at" TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE,
  UNIQUE("doctor_id", "date")
);

-- Schedule Notifications for reminders and alerts
CREATE TABLE "ScheduleNotifications" (
  "id" SERIAL PRIMARY KEY,
  "doctor_id" TEXT NOT NULL,
  "appointment_id" INTEGER,
  "notification_type" TEXT NOT NULL, -- 'APPOINTMENT_REMINDER', 'SCHEDULE_CONFLICT', 'EXCEPTION_ALERT', 'SYNC_ERROR'
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "scheduled_for" TIMESTAMP NOT NULL,
  "is_sent" BOOLEAN DEFAULT false,
  "sent_at" TIMESTAMP,
  "delivery_method" TEXT DEFAULT 'IN_APP', -- 'IN_APP', 'EMAIL', 'SMS', 'PUSH'
  "priority" TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  "metadata" JSONB, -- Additional data for the notification
  "created_at" TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE,
  FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX "idx_working_days_doctor_effective" ON "WorkingDays"("doctor_id", "effective_from", "effective_until");
CREATE INDEX "idx_schedule_exceptions_doctor_date" ON "ScheduleExceptions"("doctor_id", "start_date", "end_date");
CREATE INDEX "idx_schedule_conflicts_doctor_status" ON "ScheduleConflicts"("doctor_id", "status", "created_at");
CREATE INDEX "idx_schedule_analytics_doctor_date" ON "ScheduleAnalytics"("doctor_id", "date");
CREATE INDEX "idx_schedule_notifications_doctor_scheduled" ON "ScheduleNotifications"("doctor_id", "scheduled_for", "is_sent");

-- Enums for better type safety
CREATE TYPE "RecurrenceType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');
CREATE TYPE "ExceptionType" AS ENUM ('HOLIDAY', 'VACATION', 'SICK_LEAVE', 'EMERGENCY', 'CUSTOM', 'TRAINING', 'CONFERENCE');
CREATE TYPE "ConflictType" AS ENUM ('DOUBLE_BOOKING', 'OVERLAP', 'EXCEPTION_VIOLATION', 'CALENDAR_SYNC', 'BUFFER_VIOLATION');
CREATE TYPE "ConflictSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ResolutionMethod" AS ENUM ('AUTO_RESCHEDULE', 'MANUAL_RESOLUTION', 'CANCEL_APPOINTMENT', 'IGNORE_CONFLICT');
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_REMINDER', 'SCHEDULE_CONFLICT', 'EXCEPTION_ALERT', 'SYNC_ERROR', 'SCHEDULE_UPDATE');
CREATE TYPE "DeliveryMethod" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WEBHOOK');


