/*
  Warnings:

  - The `availability_status` column on the `Doctor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'EMERGENCY_UNAVAILABLE', 'TEMPORARILY_UNAVAILABLE');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'PERSONAL', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'STUDY', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AvailabilityUpdateType" AS ENUM ('SCHEDULE_CHANGE', 'EMERGENCY_UNAVAILABLE', 'TEMPORARY_UNAVAILABLE', 'CAPACITY_UPDATE', 'BREAK_TIME_UPDATE');

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "consultation_fee" DOUBLE PRECISION,
ADD COLUMN     "emergency_contact" TEXT,
ADD COLUMN     "emergency_phone" TEXT,
ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "max_patients_per_day" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "preferred_appointment_duration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "qualifications" TEXT,
DROP COLUMN "availability_status",
ADD COLUMN     "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "WorkingDays" ADD COLUMN     "appointment_duration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "break_end" TEXT,
ADD COLUMN     "break_start" TEXT,
ADD COLUMN     "is_working" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max_appointments" INTEGER NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" SERIAL NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityUpdate" (
    "id" SERIAL NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "update_type" "AvailabilityUpdateType" NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "reason" TEXT,
    "is_temporary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeaveRequest_doctor_id_idx" ON "LeaveRequest"("doctor_id");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");

-- CreateIndex
CREATE INDEX "LeaveRequest_start_date_idx" ON "LeaveRequest"("start_date");

-- CreateIndex
CREATE INDEX "LeaveRequest_end_date_idx" ON "LeaveRequest"("end_date");

-- CreateIndex
CREATE INDEX "AvailabilityUpdate_doctor_id_idx" ON "AvailabilityUpdate"("doctor_id");

-- CreateIndex
CREATE INDEX "AvailabilityUpdate_update_type_idx" ON "AvailabilityUpdate"("update_type");

-- CreateIndex
CREATE INDEX "AvailabilityUpdate_effective_date_idx" ON "AvailabilityUpdate"("effective_date");

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityUpdate" ADD CONSTRAINT "AvailabilityUpdate_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
