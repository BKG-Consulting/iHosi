-- Enhance scheduling support
-- This migration adds missing fields and fixes inconsistencies in the scheduling system

-- Fix WorkingDays table field names and add missing fields
ALTER TABLE "WorkingDays" RENAME COLUMN "day" TO "day_of_week";
ALTER TABLE "WorkingDays" RENAME COLUMN "close_time" TO "end_time";
ALTER TABLE "WorkingDays" RENAME COLUMN "break_start" TO "break_start_time";
ALTER TABLE "WorkingDays" RENAME COLUMN "break_end" TO "break_end_time";

-- Add missing fields to WorkingDays
ALTER TABLE "WorkingDays" ADD COLUMN IF NOT EXISTS "max_appointments" INTEGER DEFAULT 20;

-- Add missing fields to Doctor table for scheduling
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "appointment_duration" INTEGER DEFAULT 30;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "buffer_time" INTEGER DEFAULT 5;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "availability_status" "AvailabilityStatus" DEFAULT 'AVAILABLE';

-- Update LeaveType enum to match our scheduling system
ALTER TYPE "LeaveType" ADD VALUE IF NOT EXISTS 'VACATION';
ALTER TYPE "LeaveType" ADD VALUE IF NOT EXISTS 'SICK_LEAVE';
ALTER TYPE "LeaveType" ADD VALUE IF NOT EXISTS 'PERSONAL';
ALTER TYPE "LeaveType" ADD VALUE IF NOT EXISTS 'CONFERENCE';

-- Add unique constraint to WorkingDays to prevent duplicate entries
ALTER TABLE "WorkingDays" ADD CONSTRAINT "WorkingDays_doctor_id_day_of_week_key" UNIQUE ("doctor_id", "day_of_week");

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "WorkingDays_doctor_id_idx" ON "WorkingDays"("doctor_id");
CREATE INDEX IF NOT EXISTS "LeaveRequest_doctor_id_idx" ON "LeaveRequest"("doctor_id");
CREATE INDEX IF NOT EXISTS "LeaveRequest_status_idx" ON "LeaveRequest"("status");
CREATE INDEX IF NOT EXISTS "AvailabilityUpdate_doctor_id_idx" ON "AvailabilityUpdate"("doctor_id");

-- Add comments for documentation
COMMENT ON TABLE "WorkingDays" IS 'Stores doctor working hours for each day of the week';
COMMENT ON TABLE "LeaveRequest" IS 'Stores doctor leave/vacation requests';
COMMENT ON TABLE "AvailabilityUpdate" IS 'Stores temporary availability changes for doctors';

COMMENT ON COLUMN "WorkingDays"."day_of_week" IS 'Day of the week (Monday, Tuesday, etc.)';
COMMENT ON COLUMN "WorkingDays"."start_time" IS 'Start time in HH:MM format';
COMMENT ON COLUMN "WorkingDays"."end_time" IS 'End time in HH:MM format';
COMMENT ON COLUMN "WorkingDays"."break_start_time" IS 'Break start time in HH:MM format';
COMMENT ON COLUMN "WorkingDays"."break_end_time" IS 'Break end time in HH:MM format';
COMMENT ON COLUMN "WorkingDays"."max_appointments" IS 'Maximum appointments allowed per day';
COMMENT ON COLUMN "WorkingDays"."is_working" IS 'Whether the doctor works on this day';

COMMENT ON COLUMN "LeaveRequest"."leave_type" IS 'Type of leave (VACATION, SICK_LEAVE, etc.)';
COMMENT ON COLUMN "LeaveRequest"."status" IS 'Approval status of the leave request';
COMMENT ON COLUMN "LeaveRequest"."approved_by" IS 'ID of the user who approved the leave';
COMMENT ON COLUMN "LeaveRequest"."approved_at" IS 'Timestamp when the leave was approved';

COMMENT ON COLUMN "AvailabilityUpdate"."update_type" IS 'Type of availability update';
COMMENT ON COLUMN "AvailabilityUpdate"."effective_date" IS 'When the update takes effect';
COMMENT ON COLUMN "AvailabilityUpdate"."end_date" IS 'When the update expires (if temporary)';
COMMENT ON COLUMN "AvailabilityUpdate"."is_temporary" IS 'Whether this is a temporary change';

COMMENT ON COLUMN "Doctor"."appointment_duration" IS 'Default appointment duration in minutes';
COMMENT ON COLUMN "Doctor"."buffer_time" IS 'Buffer time between appointments in minutes';
COMMENT ON COLUMN "Doctor"."availability_status" IS 'Current availability status of the doctor';

