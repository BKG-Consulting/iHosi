import { z } from "zod";

export const PatientFormSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name can't be more than 50 characters"),
  last_name: z
    .string()
    .trim()
    .min(2, "dLast name must be at least 2 characters")
    .max(30, "First name can't be more than 50 characters"),
  date_of_birth: z.coerce.date(),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),

  phone: z.string().min(10, "Enter phone number").max(15, "Phone number too long"),
  email: z.string().email("Invalid email address."),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),
  marital_status: z.enum(
    ["married", "single", "divorced", "widowed", "separated"],
    { message: "Marital status is required." }
  ),
  emergency_contact_name: z
    .string()
    .min(2, "Emergency contact name is required.")
    .max(50, "Emergency contact must be at most 50 characters"),
  emergency_contact_number: z
    .string()
    .min(10, "Enter phone number")
    .max(15, "Phone number too long"),
  relation: z.enum(["mother", "father", "husband", "wife", "spouse", "other"], {
    message: "Relations with contact person required",
  }),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  medical_history: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_number: z.string().optional(),
  privacy_consent: z
    .boolean()
    .default(false)
    .refine((val) => val === true, {
      message: "You must agree to the privacy policy.",
    }),
  service_consent: z
    .boolean()
    .default(false)
    .refine((val) => val === true, {
      message: "You must agree to the terms of service.",
    }),
  medical_consent: z
    .boolean()
    .default(false)
    .refine((val) => val === true, {
      message: "You must agree to the medical treatment terms.",
    }),
  img: z.string().optional(),
});

export const AppointmentSchema = z.object({
  doctor_id: z.string().min(1, "Select physician"),
  type: z.string().min(1, "Select type of appointment"),
  appointment_date: z.string().min(1, "Select appointment date"),
  time: z.string().min(1, "Select appointment time"),
  note: z.string().optional(),
  reason: z.string().optional(),
});

export const DoctorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  phone: z.string().min(10, "Enter phone number").max(10, "Enter phone number"),
  email: z.string().email("Invalid email address."),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),
  specialization: z.string().min(2, "Specialization is required."),
  license_number: z.string().min(2, "License number is required"),
  type: z.enum(["FULL", "PART"], { message: "Type is required." }),
  department: z.string().min(2, "Department is required."),
  emergency_contact: z.string().min(2, "Emergency contact is required."),
  emergency_phone: z.string().min(10, "Emergency phone is required.").max(10, "Emergency phone must be 10 digits"),
  qualifications: z.string().min(2, "Qualifications are required."),
  experience_years: z.coerce.number().min(0, "Experience years must be 0 or more"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  consultation_fee: z.coerce.number().min(0, "Consultation fee must be 0 or more"),
  max_patients_per_day: z.coerce.number().min(1, "Max patients per day must be at least 1"),
  preferred_appointment_duration: z.coerce.number().min(15, "Appointment duration must be at least 15 minutes"),
  img: z.string().optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
});

export const workingDaySchema = z.object({
  day: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  start_time: z.string(),
  close_time: z.string(),
  is_working: z.boolean().default(true),
  break_start: z.string().optional(),
  break_end: z.string().optional(),
  max_appointments: z.coerce.number().optional(),
  appointment_duration: z.coerce.number().optional(),
});
export const WorkingDaysSchema = z.array(workingDaySchema).optional();

export const StaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  role: z.enum(["NURSE", "LAB_TECHNICIAN", "CASHIER", "ADMIN_ASSISTANT"], { message: "Role is required." }),
  phone: z
    .string()
    .min(10, "Contact must be 10-digits")
    .max(15, "Contact must be at most 15 digits"),
  email: z.string().email("Invalid email address."),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),
  license_number: z.string().optional(),
  department: z.string().optional(),
  department_id: z.string().optional(),
  img: z.string().optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
});

export const VitalSignsSchema = z.object({
  patient_id: z.string(),
  medical_id: z.string(),
  body_temperature: z.coerce.number({
    message: "Enter recorded body temperature",
  }),
  heartRate: z.string({ message: "Enter recorded heartbeat rate" }),
  systolic: z.coerce.number({
    message: "Enter recorded systolic blood pressure",
  }),
  diastolic: z.coerce.number({
    message: "Enter recorded diastolic blood pressure",
  }),
  respiratory_rate: z.coerce.number().optional(),
  oxygen_saturation: z.coerce.number().optional(),
  weight: z.coerce.number({ message: "Enter recorded weight (Kg)" }),
  height: z.coerce.number({ message: "Enter recorded height (Cm)" }),
});

export const DiagnosisSchema = z.object({
  patient_id: z.string(),
  medical_id: z.string(),
  doctor_id: z.string(),
  symptoms: z.string({ message: "Symptoms required" }),
  diagnosis: z.string({ message: "Diagnosis required" }),
  notes: z.string().optional(),
  prescribed_medications: z.string().optional(),
  follow_up_plan: z.string().optional(),
});

export const PaymentSchema = z.object({
  id: z.string(),
  // patient_id: z.string(),
  // appointment_id: z.string(),
  bill_date: z.coerce.date(),
  // payment_date: z.string(),
  discount: z.string({ message: "discount" }),
  total_amount: z.string(),
  // amount_paid: z.string(),
});

export const PatientBillSchema = z.object({
  bill_id: z.string(),
  service_id: z.string(),
  service_date: z.string(),
  appointment_id: z.string(),
  quantity: z.string({ message: "Quantity is required" }),
  unit_cost: z.string({ message: "Unit cost is required" }),
  total_cost: z.string({ message: "Total cost is required" }),
});

export const ServicesSchema = z.object({
  service_name: z.string({ message: "Service name is required" }),
  price: z.string({ message: "Service price is required" }),
  description: z.string({ message: "Service description is required" }),
});

export const LeaveRequestSchema = z.object({
  doctor_id: z.string().min(1, "Doctor ID is required"),
  leave_type: z.enum(["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"]),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).default("PENDING"),
  approved_by: z.string().optional(),
  approved_at: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const AvailabilityUpdateSchema = z.object({
  doctor_id: z.string().min(1, "Doctor ID is required"),
  update_type: z.enum(["SCHEDULE_CHANGE", "EMERGENCY_UNAVAILABLE", "TEMPORARY_UNAVAILABLE", "CAPACITY_UPDATE", "BREAK_TIME_UPDATE"]),
  effective_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  reason: z.string().optional(),
  is_temporary: z.boolean().default(false),
});

// New enterprise HIMS schemas
export const DepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").max(100, "Department name must be at most 100 characters"),
  code: z.string().min(2, "Department code must be at least 2 characters").max(10, "Department code must be at most 10 characters"),
  description: z.string().optional(),
  location: z.string().optional(),
  contact_number: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  head_doctor_id: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "CLOSED"]).default("ACTIVE"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").max(1000, "Capacity must be at most 1000").default(100),
  current_load: z.coerce.number().min(0, "Current load cannot be negative").default(0),
});

export const WardSchema = z.object({
  name: z.string().min(2, "Ward name must be at least 2 characters").max(100, "Ward name must be at most 100 characters"),
  department_id: z.string().min(1, "Department is required"),
  floor: z.coerce.number().min(1, "Floor must be at least 1").optional(),
  wing: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").max(200, "Capacity must be at most 200").default(20),
  current_occupancy: z.coerce.number().min(0, "Current occupancy cannot be negative").default(0),
  ward_type: z.enum([
    "INTENSIVE_CARE", "GENERAL", "EMERGENCY", "OPERATING_ROOM", "RECOVERY", 
    "PEDIATRIC", "MATERNITY", "PSYCHIATRIC", "ISOLATION", "STEP_DOWN"
  ]),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "QUARANTINE", "CLOSED"]).default("ACTIVE"),
});

export const BedSchema = z.object({
  bed_number: z.string().min(1, "Bed number is required").max(10, "Bed number must be at most 10 characters"),
  ward_id: z.string().min(1, "Ward is required"),
  bed_type: z.enum(["STANDARD", "ICU", "ISOLATION", "BARIATRIC", "PEDIATRIC", "MATERNITY"]),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE", "CLEANING", "RESERVED", "OUT_OF_SERVICE"]).default("AVAILABLE"),
  current_patient_id: z.string().optional(),
  last_cleaned: z.coerce.date().optional(),
  infection_status: z.enum(["CLEAN", "CONTAMINATED", "ISOLATION_REQUIRED", "UNDER_CLEANING"]).default("CLEAN"),
});

export const EquipmentSchema = z.object({
  name: z.string().min(2, "Equipment name must be at least 2 characters").max(100, "Equipment name must be at most 100 characters"),
  model: z.string().optional(),
  serial_number: z.string().min(1, "Serial number is required").max(50, "Serial number must be at most 50 characters"),
  department_id: z.string().optional(),
  ward_id: z.string().optional(),
  equipment_type: z.enum([
    "DIAGNOSTIC", "MONITORING", "SURGICAL", "IMAGING", "LABORATORY", 
    "THERAPEUTIC", "SUPPORT", "TRANSPORT"
  ]),
  status: z.enum(["OPERATIONAL", "MAINTENANCE", "OUT_OF_SERVICE", "RETIRED", "QUARANTINED"]).default("OPERATIONAL"),
  manufacturer: z.string().optional(),
  purchase_date: z.coerce.date().optional(),
  warranty_expiry: z.coerce.date().optional(),
  last_maintenance: z.coerce.date().optional(),
  next_maintenance: z.coerce.date().optional(),
  maintenance_cycle: z.coerce.number().min(1, "Maintenance cycle must be at least 1 day").optional(),
});
