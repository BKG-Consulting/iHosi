import { z } from "zod";
export declare const PatientFormSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    date_of_birth: z.ZodDate;
    gender: z.ZodEnum<["MALE", "FEMALE"]>;
    phone: z.ZodString;
    email: z.ZodString;
    address: z.ZodString;
    marital_status: z.ZodEnum<["married", "single", "divorced", "widowed", "separated"]>;
    emergency_contact_name: z.ZodString;
    emergency_contact_number: z.ZodString;
    relation: z.ZodEnum<["mother", "father", "husband", "wife", "other"]>;
    blood_group: z.ZodOptional<z.ZodString>;
    allergies: z.ZodOptional<z.ZodString>;
    medical_conditions: z.ZodOptional<z.ZodString>;
    medical_history: z.ZodOptional<z.ZodString>;
    insurance_provider: z.ZodOptional<z.ZodString>;
    insurance_number: z.ZodOptional<z.ZodString>;
    privacy_consent: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, boolean | undefined>;
    service_consent: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, boolean | undefined>;
    medical_consent: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, boolean | undefined>;
    img: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    gender: "MALE" | "FEMALE";
    phone: string;
    email: string;
    marital_status: "single" | "married" | "divorced" | "widowed" | "separated";
    address: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    relation: "mother" | "father" | "husband" | "wife" | "other";
    privacy_consent: boolean;
    service_consent: boolean;
    medical_consent: boolean;
    blood_group?: string | undefined;
    allergies?: string | undefined;
    medical_conditions?: string | undefined;
    medical_history?: string | undefined;
    insurance_provider?: string | undefined;
    insurance_number?: string | undefined;
    img?: string | undefined;
}, {
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    gender: "MALE" | "FEMALE";
    phone: string;
    email: string;
    marital_status: "single" | "married" | "divorced" | "widowed" | "separated";
    address: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    relation: "mother" | "father" | "husband" | "wife" | "other";
    blood_group?: string | undefined;
    allergies?: string | undefined;
    medical_conditions?: string | undefined;
    medical_history?: string | undefined;
    insurance_provider?: string | undefined;
    insurance_number?: string | undefined;
    privacy_consent?: boolean | undefined;
    service_consent?: boolean | undefined;
    medical_consent?: boolean | undefined;
    img?: string | undefined;
}>;
export declare const AppointmentSchema: z.ZodObject<{
    doctor_id: z.ZodString;
    type: z.ZodString;
    appointment_date: z.ZodString;
    time: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    doctor_id: string;
    appointment_date: string;
    time: string;
    type: string;
    note?: string | undefined;
}, {
    doctor_id: string;
    appointment_date: string;
    time: string;
    type: string;
    note?: string | undefined;
}>;
export declare const DoctorSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodString;
    address: z.ZodString;
    specialization: z.ZodString;
    license_number: z.ZodString;
    type: z.ZodEnum<["FULL", "PART"]>;
    department: z.ZodString;
    img: z.ZodOptional<z.ZodString>;
    password: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "FULL" | "PART";
    phone: string;
    email: string;
    address: string;
    specialization: string;
    license_number: string;
    department: string;
    img?: string | undefined;
    password?: string | undefined;
}, {
    name: string;
    type: "FULL" | "PART";
    phone: string;
    email: string;
    address: string;
    specialization: string;
    license_number: string;
    department: string;
    img?: string | undefined;
    password?: string | undefined;
}>;
export declare const workingDaySchema: z.ZodObject<{
    day: z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>;
    start_time: z.ZodString;
    close_time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    start_time: string;
    close_time: string;
}, {
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    start_time: string;
    close_time: string;
}>;
export declare const WorkingDaysSchema: z.ZodOptional<z.ZodArray<z.ZodObject<{
    day: z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>;
    start_time: z.ZodString;
    close_time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    start_time: string;
    close_time: string;
}, {
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    start_time: string;
    close_time: string;
}>, "many">>;
export declare const StaffSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodEnum<["NURSE", "LAB_TECHNICIAN"]>;
    phone: z.ZodString;
    email: z.ZodString;
    address: z.ZodString;
    license_number: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    img: z.ZodOptional<z.ZodString>;
    password: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    email: string;
    address: string;
    role: "NURSE" | "LAB_TECHNICIAN";
    img?: string | undefined;
    license_number?: string | undefined;
    department?: string | undefined;
    password?: string | undefined;
}, {
    name: string;
    phone: string;
    email: string;
    address: string;
    role: "NURSE" | "LAB_TECHNICIAN";
    img?: string | undefined;
    license_number?: string | undefined;
    department?: string | undefined;
    password?: string | undefined;
}>;
export declare const VitalSignsSchema: z.ZodObject<{
    patient_id: z.ZodString;
    medical_id: z.ZodString;
    body_temperature: z.ZodNumber;
    heartRate: z.ZodString;
    systolic: z.ZodNumber;
    diastolic: z.ZodNumber;
    respiratory_rate: z.ZodOptional<z.ZodNumber>;
    oxygen_saturation: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodNumber;
    height: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    medical_id: string;
    body_temperature: number;
    heartRate: string;
    systolic: number;
    diastolic: number;
    weight: number;
    height: number;
    respiratory_rate?: number | undefined;
    oxygen_saturation?: number | undefined;
}, {
    patient_id: string;
    medical_id: string;
    body_temperature: number;
    heartRate: string;
    systolic: number;
    diastolic: number;
    weight: number;
    height: number;
    respiratory_rate?: number | undefined;
    oxygen_saturation?: number | undefined;
}>;
export declare const DiagnosisSchema: z.ZodObject<{
    patient_id: z.ZodString;
    medical_id: z.ZodString;
    doctor_id: z.ZodString;
    symptoms: z.ZodString;
    diagnosis: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    prescribed_medications: z.ZodOptional<z.ZodString>;
    follow_up_plan: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    doctor_id: string;
    diagnosis: string;
    medical_id: string;
    symptoms: string;
    notes?: string | undefined;
    prescribed_medications?: string | undefined;
    follow_up_plan?: string | undefined;
}, {
    patient_id: string;
    doctor_id: string;
    diagnosis: string;
    medical_id: string;
    symptoms: string;
    notes?: string | undefined;
    prescribed_medications?: string | undefined;
    follow_up_plan?: string | undefined;
}>;
export declare const PaymentSchema: z.ZodObject<{
    id: z.ZodString;
    bill_date: z.ZodDate;
    discount: z.ZodString;
    total_amount: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    bill_date: Date;
    discount: string;
    total_amount: string;
}, {
    id: string;
    bill_date: Date;
    discount: string;
    total_amount: string;
}>;
export declare const PatientBillSchema: z.ZodObject<{
    bill_id: z.ZodString;
    service_id: z.ZodString;
    service_date: z.ZodString;
    appointment_id: z.ZodString;
    quantity: z.ZodString;
    unit_cost: z.ZodString;
    total_cost: z.ZodString;
}, "strip", z.ZodTypeAny, {
    service_id: string;
    bill_id: string;
    service_date: string;
    appointment_id: string;
    quantity: string;
    unit_cost: string;
    total_cost: string;
}, {
    service_id: string;
    bill_id: string;
    service_date: string;
    appointment_id: string;
    quantity: string;
    unit_cost: string;
    total_cost: string;
}>;
export declare const ServicesSchema: z.ZodObject<{
    service_name: z.ZodString;
    price: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    service_name: string;
    price: string;
}, {
    description: string;
    service_name: string;
    price: string;
}>;
