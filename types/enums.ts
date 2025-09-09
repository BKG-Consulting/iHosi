// Centralized enum definitions that match Prisma schema exactly
// This file serves as the single source of truth for all enum types

// Import Prisma enums
import {
  AppointmentStatus,
  AvailabilityStatus,
  LeaveType,
  LeaveStatus,
  AvailabilityUpdateType,
  Role,
  Status,
  Gender,
  PaymentMethod,
  PaymentStatus,
  ConsentType,
  ConsentStatus,
  AdmissionType,
  AdmissionStatus,
  PriorityLevel,
  DepartmentStatus,
  WardType,
  WardStatus,
  BedType,
  BedStatus,
  InfectionStatus,
  EquipmentType,
  EquipmentStatus,
  BillStatus,
  InvoiceStatus,
  PaymentPlanStatus,
  InsuranceStatus,
  ClaimStatus,
  VerificationType,
  JOBTYPE
} from '@prisma/client';

// Re-export Prisma enums to ensure consistency
export {
  AppointmentStatus,
  AvailabilityStatus,
  LeaveType,
  LeaveStatus,
  AvailabilityUpdateType,
  Role,
  Status,
  Gender,
  PaymentMethod,
  PaymentStatus,
  ConsentType,
  ConsentStatus,
  AdmissionType,
  AdmissionStatus,
  PriorityLevel,
  DepartmentStatus,
  WardType,
  WardStatus,
  BedType,
  BedStatus,
  InfectionStatus,
  EquipmentType,
  EquipmentStatus,
  BillStatus,
  InvoiceStatus,
  PaymentPlanStatus,
  InsuranceStatus,
  ClaimStatus,
  VerificationType,
  JOBTYPE
};

// Type aliases for better developer experience
export type AppointmentStatusType = AppointmentStatus;
export type AvailabilityStatusType = AvailabilityStatus;
export type LeaveTypeType = LeaveType;
export type LeaveStatusType = LeaveStatus;
export type AvailabilityUpdateTypeType = AvailabilityUpdateType;

// Helper functions for type conversion
export const convertToAppointmentStatus = (status: string): AppointmentStatus => {
  return status as AppointmentStatus;
};

export const convertToAvailabilityStatus = (status: string): AvailabilityStatus => {
  return status as AvailabilityStatus;
};

export const convertToLeaveType = (type: string): LeaveType => {
  return type as LeaveType;
};

export const convertToLeaveStatus = (status: string): LeaveStatus => {
  return status as LeaveStatus;
};

export const convertToAvailabilityUpdateType = (type: string): AvailabilityUpdateType => {
  return type as AvailabilityUpdateType;
};

// Enum value arrays for validation and iteration
export const APPOINTMENT_STATUS_VALUES = Object.values(AppointmentStatus);
export const AVAILABILITY_STATUS_VALUES = Object.values(AvailabilityStatus);
export const LEAVE_TYPE_VALUES = Object.values(LeaveType);
export const LEAVE_STATUS_VALUES = Object.values(LeaveStatus);
export const AVAILABILITY_UPDATE_TYPE_VALUES = Object.values(AvailabilityUpdateType);
