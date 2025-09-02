"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_ROLES = exports.RELATION = exports.MARITAL_STATUS = exports.GENDER = void 0;
exports.GENDER = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
];
exports.MARITAL_STATUS = [
    { label: "Single", value: "single" },
    { label: "Married", value: "married" },
    { label: "Divorced", value: "divorced" },
    { label: "Widowed", value: "widowed" },
    { label: "Separated", value: "separated" },
];
exports.RELATION = [
    { value: "mother", label: "Mother" },
    { value: "father", label: "Father" },
    { value: "husband", label: "Husband" },
    { value: "wife", label: "Wife" },
    { value: "other", label: "Other" },
];
exports.USER_ROLES = {
    ADMIN: "ADMIN",
    DOCTOR: "DOCTOR",
    NURSE: "NURSE",
    LAB_TECHNICIAN: "LAB_TECHNICIAN",
    PATIENT: "PATIENT",
    CASHIER: "CASHIER",
};
