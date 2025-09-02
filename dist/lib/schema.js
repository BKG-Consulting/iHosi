"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesSchema = exports.PatientBillSchema = exports.PaymentSchema = exports.DiagnosisSchema = exports.VitalSignsSchema = exports.StaffSchema = exports.WorkingDaysSchema = exports.workingDaySchema = exports.DoctorSchema = exports.AppointmentSchema = exports.PatientFormSchema = void 0;
const zod_1 = require("zod");
exports.PatientFormSchema = zod_1.z.object({
    first_name: zod_1.z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(30, "First name can't be more than 50 characters"),
    last_name: zod_1.z
        .string()
        .trim()
        .min(2, "dLast name must be at least 2 characters")
        .max(30, "First name can't be more than 50 characters"),
    date_of_birth: zod_1.z.coerce.date(),
    gender: zod_1.z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
    phone: zod_1.z.string().min(10, "Enter phone number").max(10, "Enter phone number"),
    email: zod_1.z.string().email("Invalid email address."),
    address: zod_1.z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(500, "Address must be at most 500 characters"),
    marital_status: zod_1.z.enum(["married", "single", "divorced", "widowed", "separated"], { message: "Marital status is required." }),
    emergency_contact_name: zod_1.z
        .string()
        .min(2, "Emergency contact name is required.")
        .max(50, "Emergency contact must be at most 50 characters"),
    emergency_contact_number: zod_1.z
        .string()
        .min(10, "Enter phone number")
        .max(10, "Enter phone number"),
    relation: zod_1.z.enum(["mother", "father", "husband", "wife", "other"], {
        message: "Relations with contact person required",
    }),
    blood_group: zod_1.z.string().optional(),
    allergies: zod_1.z.string().optional(),
    medical_conditions: zod_1.z.string().optional(),
    medical_history: zod_1.z.string().optional(),
    insurance_provider: zod_1.z.string().optional(),
    insurance_number: zod_1.z.string().optional(),
    privacy_consent: zod_1.z
        .boolean()
        .default(false)
        .refine((val) => val === true, {
        message: "You must agree to the privacy policy.",
    }),
    service_consent: zod_1.z
        .boolean()
        .default(false)
        .refine((val) => val === true, {
        message: "You must agree to the terms of service.",
    }),
    medical_consent: zod_1.z
        .boolean()
        .default(false)
        .refine((val) => val === true, {
        message: "You must agree to the medical treatment terms.",
    }),
    img: zod_1.z.string().optional(),
});
exports.AppointmentSchema = zod_1.z.object({
    doctor_id: zod_1.z.string().min(1, "Select physician"),
    type: zod_1.z.string().min(1, "Select type of appointment"),
    appointment_date: zod_1.z.string().min(1, "Select appointment date"),
    time: zod_1.z.string().min(1, "Select appointment time"),
    note: zod_1.z.string().optional(),
});
exports.DoctorSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters"),
    phone: zod_1.z.string().min(10, "Enter phone number").max(10, "Enter phone number"),
    email: zod_1.z.string().email("Invalid email address."),
    address: zod_1.z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(500, "Address must be at most 500 characters"),
    specialization: zod_1.z.string().min(2, "Specialization is required."),
    license_number: zod_1.z.string().min(2, "License number is required"),
    type: zod_1.z.enum(["FULL", "PART"], { message: "Type is required." }),
    department: zod_1.z.string().min(2, "Department is required."),
    img: zod_1.z.string().optional(),
    password: zod_1.z
        .string()
        .min(8, { message: "Password must be at least 8 characters long!" })
        .optional()
        .or(zod_1.z.literal("")),
});
exports.workingDaySchema = zod_1.z.object({
    day: zod_1.z.enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ]),
    start_time: zod_1.z.string(),
    close_time: zod_1.z.string(),
});
exports.WorkingDaysSchema = zod_1.z.array(exports.workingDaySchema).optional();
exports.StaffSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters"),
    role: zod_1.z.enum(["NURSE", "LAB_TECHNICIAN"], { message: "Role is required." }),
    phone: zod_1.z
        .string()
        .min(10, "Contact must be 10-digits")
        .max(10, "Contact must be 10-digits"),
    email: zod_1.z.string().email("Invalid email address."),
    address: zod_1.z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(500, "Address must be at most 500 characters"),
    license_number: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    img: zod_1.z.string().optional(),
    password: zod_1.z
        .string()
        .min(8, { message: "Password must be at least 8 characters long!" })
        .optional()
        .or(zod_1.z.literal("")),
});
exports.VitalSignsSchema = zod_1.z.object({
    patient_id: zod_1.z.string(),
    medical_id: zod_1.z.string(),
    body_temperature: zod_1.z.coerce.number({
        message: "Enter recorded body temperature",
    }),
    heartRate: zod_1.z.string({ message: "Enter recorded heartbeat rate" }),
    systolic: zod_1.z.coerce.number({
        message: "Enter recorded systolic blood pressure",
    }),
    diastolic: zod_1.z.coerce.number({
        message: "Enter recorded diastolic blood pressure",
    }),
    respiratory_rate: zod_1.z.coerce.number().optional(),
    oxygen_saturation: zod_1.z.coerce.number().optional(),
    weight: zod_1.z.coerce.number({ message: "Enter recorded weight (Kg)" }),
    height: zod_1.z.coerce.number({ message: "Enter recorded height (Cm)" }),
});
exports.DiagnosisSchema = zod_1.z.object({
    patient_id: zod_1.z.string(),
    medical_id: zod_1.z.string(),
    doctor_id: zod_1.z.string(),
    symptoms: zod_1.z.string({ message: "Symptoms required" }),
    diagnosis: zod_1.z.string({ message: "Diagnosis required" }),
    notes: zod_1.z.string().optional(),
    prescribed_medications: zod_1.z.string().optional(),
    follow_up_plan: zod_1.z.string().optional(),
});
exports.PaymentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    // patient_id: z.string(),
    // appointment_id: z.string(),
    bill_date: zod_1.z.coerce.date(),
    // payment_date: z.string(),
    discount: zod_1.z.string({ message: "discount" }),
    total_amount: zod_1.z.string(),
    // amount_paid: z.string(),
});
exports.PatientBillSchema = zod_1.z.object({
    bill_id: zod_1.z.string(),
    service_id: zod_1.z.string(),
    service_date: zod_1.z.string(),
    appointment_id: zod_1.z.string(),
    quantity: zod_1.z.string({ message: "Quantity is required" }),
    unit_cost: zod_1.z.string({ message: "Unit cost is required" }),
    total_cost: zod_1.z.string({ message: "Total cost is required" }),
});
exports.ServicesSchema = zod_1.z.object({
    service_name: zod_1.z.string({ message: "Service name is required" }),
    price: zod_1.z.string({ message: "Service price is required" }),
    description: zod_1.z.string({ message: "Service description is required" }),
});
