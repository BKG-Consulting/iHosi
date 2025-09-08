"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
// Remove this import - Patient type is not exported from Prisma client
import { 
  User, 
  Heart, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Users,
  FileText,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Form } from "./ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema } from "@/lib/schema";
import { z } from "zod";
import { CustomInput } from "./custom-input";
import { GENDER, MARITAL_STATUS, RELATION } from "@/lib";
import { Button } from "./ui/button";
import { createNewPatient, updatePatient } from "@/app/actions/patient";
import { toast } from "sonner";

interface DataProps {
  data?: any; // Changed from Patient to any since Patient type is not exported
  type: "create" | "update";
}
export const NewPatient = ({ data, type }: DataProps) => {
  const { user, loading: userLoading } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imgURL, setImgURL] = useState<any>();
  const router = useRouter();

  const steps = [
    {
      id: 1,
      title: "Personal Information",
      description: "Basic details about you",
      icon: User,
      fields: ["first_name", "last_name", "email", "phone", "date_of_birth", "gender", "marital_status", "address"]
    },
    {
      id: 2,
      title: "Emergency Contact",
      description: "Someone we can reach in case of emergency",
      icon: Users,
      fields: ["emergency_contact_name", "emergency_contact_number", "relation"]
    },
    {
      id: 3,
      title: "Medical Information",
      description: "Your health and medical history",
      icon: Heart,
      fields: ["blood_group", "allergies", "medical_conditions", "medical_history", "insurance_provider", "insurance_number"]
    },
    {
      id: 4,
      title: "Consent & Privacy",
      description: "Terms and conditions",
      icon: Shield,
      fields: ["privacy_consent", "service_consent", "medical_consent"]
    }
  ];

  const totalSteps = steps.length;

  // Ensure all default values are properly defined to prevent controlled/uncontrolled input issues
  type MaritalStatus = "married" | "single" | "divorced" | "widowed" | "separated";
  type RelationType = "mother" | "father" | "husband" | "wife" | "spouse" | "other";

  const getDefaultValues = () => {
    const baseDefaults = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      date_of_birth: new Date(),
      gender: "MALE" as const,
      marital_status: "single" as MaritalStatus,
      emergency_contact_name: "",
      emergency_contact_number: "",
      relation: "mother" as RelationType,
      blood_group: "",
      allergies: "",
      medical_conditions: "",
      insurance_number: "",
      insurance_provider: "",
      medical_history: "",
      privacy_consent: false,
      service_consent: false,
      medical_consent: false,
    };

    // Safely populate user data if available
    if (user) {
      baseDefaults.first_name = user?.firstName || "";
      baseDefaults.last_name = user?.lastName || "";
      baseDefaults.email = user?.email || "";
      baseDefaults.phone = user?.phone || "";
    }

    // If updating existing patient, merge with existing data
    if (type === "update" && data) {
      return {
        ...baseDefaults,
        ...data,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : new Date(),
        marital_status: (data.marital_status as MaritalStatus) ?? baseDefaults.marital_status,
        relation: (data.relation?.toLowerCase() as RelationType) ?? baseDefaults.relation,
      };
    }

    return baseDefaults;
  };

  const userId = user?.id;
  const form = useForm<z.infer<typeof PatientFormSchema>>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: getDefaultValues() as any,
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user && type === "create") {
      const userValues = {
        first_name: user?.firstName || "",
        last_name: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
      };
      
      // Only update if values are different to prevent unnecessary re-renders
      Object.entries(userValues).forEach(([key, value]) => {
        const currentValue = form.getValues(key as any);
        if (currentValue !== value && value) {
          form.setValue(key as any, value);
        }
      });
    }
  }, [user, form, type]);

  // Normalize relation field if it has incorrect case
  useEffect(() => {
    const currentRelation = form.getValues("relation");
    if (currentRelation && typeof currentRelation === "string") {
      const normalizedRelation = currentRelation.toLowerCase();
      if (normalizedRelation !== currentRelation) {
        console.log("Normalizing relation field from", currentRelation, "to", normalizedRelation);
        form.setValue("relation", normalizedRelation as any);
      }
    }
  }, [form]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async () => {
    const currentStepFields = steps[currentStep - 1].fields;
    const result = await form.trigger(currentStepFields as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  const onSubmit: SubmitHandler<z.infer<typeof PatientFormSchema>> = async (
    values
  ) => {
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form submission triggered", values);
    console.log("Type:", type);
    console.log("User ID:", userId);
    console.log("Form errors:", form.formState.errors);
    setLoading(true);

    try {
      if (!userId) {
        setLoading(false);
        toast.error("You must be signed in to register.");
        return;
      }

      // Normalize payload for Server Action serialization (avoid raw Date instances)
      const payload = {
        ...values,
        date_of_birth: new Date(values.date_of_birth as any).toISOString(),
      };

      console.log("Calling server action with payload:", payload);
      console.log("User ID:", userId);
      console.log("Action type:", type);





      let res;
      if (type === "create") {
              console.log("Calling createNewPatient...");
      console.log("Function exists:", typeof createNewPatient);
      console.log("Function:", createNewPatient);
      res = await createNewPatient(payload, userId);
      } else {
        console.log("Calling updatePatient...");
        res = await updatePatient(payload, userId);
      }

      console.log("Server action returned:", res);
      console.log("Response type:", typeof res);
      console.log("Response success:", res?.success);
      console.log("Response message:", res?.msg);

      setLoading(false);

      if (res && res.success) {
        toast.success(res.msg);
        form.reset();
        // Show success transition instead of immediate redirect
        router.push("/patient?success=true");
      } else {
        console.error("Registration failed - Full response:", res);
        const errorMsg = res?.msg || "Failed to create patient";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Registration error (caught exception):", error);
      setLoading(false);
      toast.error("An error occurred during registration");
    }
  };

  // Handle updating existing patient data
  useEffect(() => {
    if (type === "update" && data) {
      form.reset({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        date_of_birth: new Date(data.date_of_birth),
        gender: data.gender,
        marital_status: data.marital_status as
          | "married"
          | "single"
          | "divorced"
          | "widowed"
          | "separated",
        address: data.address,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_number: data.emergency_contact_number,
        relation: (data.relation?.toLowerCase() as
          | "mother"
          | "father"
          | "husband"
          | "wife"
          | "spouse"
          | "other") || "mother",
        blood_group: data?.blood_group || "",
        allergies: data?.allergies || "",
        medical_conditions: data?.medical_conditions || "",
        medical_history: data?.medical_history || "",
        insurance_number: data.insurance_number || "",
        insurance_provider: data.insurance_provider || "",
        medical_consent: data.medical_consent,
        privacy_consent: data.privacy_consent,
        service_consent: data.service_consent,
      });
    }
  }, [data, type, form]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomInput
                type="input"
                control={form.control}
                name="first_name"
                placeholder="John"
                label="First Name"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="last_name"
                placeholder="Doe"
                label="Last Name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomInput
                type="input"
                control={form.control}
                name="email"
                placeholder="john@example.com"
                label="Email Address"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="phone"
                placeholder="9225600735"
                label="Contact Number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CustomInput
                type="input"
                control={form.control}
                name="date_of_birth"
                placeholder="01-05-2000"
                label="Date of Birth"
                inputType="date"
              />
              <CustomInput
                type="select"
                control={form.control}
                name="gender"
                placeholder="Select gender"
                label="Gender"
                selectList={GENDER!}
              />
              <CustomInput
                type="select"
                control={form.control}
                name="marital_status"
                placeholder="Select marital status"
                label="Marital Status"
                selectList={MARITAL_STATUS!}
              />
            </div>

            <CustomInput
              type="input"
              control={form.control}
              name="address"
              placeholder="1479 Street, Apt 1839-G, NY"
              label="Address"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Emergency Contact Information</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This person will be contacted in case of a medical emergency when you're unable to respond.
                  </p>
                </div>
              </div>
            </div>

            <CustomInput
              type="input"
              control={form.control}
              name="emergency_contact_name"
              placeholder="Anne Smith"
              label="Emergency Contact Name"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomInput
                type="input"
                control={form.control}
                name="emergency_contact_number"
                placeholder="675444467"
                label="Emergency Contact Number"
              />
              <CustomInput
                type="select"
                control={form.control}
                name="relation"
                placeholder="Select relation"
                label="Relationship"
                selectList={RELATION}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Medical Information</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This information helps us provide better care and avoid any complications.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomInput
                type="input"
                control={form.control}
                name="blood_group"
                placeholder="A+"
                label="Blood Group"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="allergies"
                placeholder="Penicillin, Shellfish, etc."
                label="Known Allergies"
              />
            </div>

            <CustomInput
              type="input"
              control={form.control}
              name="medical_conditions"
              placeholder="Diabetes, Hypertension, etc."
              label="Current Medical Conditions"
            />

            <CustomInput
              type="input"
              control={form.control}
              name="medical_history"
              placeholder="Previous surgeries, treatments, etc."
              label="Medical History"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomInput
                type="input"
                control={form.control}
                name="insurance_provider"
                placeholder="Blue Cross, Aetna, etc."
                label="Insurance Provider"
              />
              <CustomInput
                type="input"
                control={form.control}
                name="insurance_number"
                placeholder="Policy number"
                label="Insurance Policy Number"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {type !== "update" && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Privacy & Consent</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Please review and accept the following terms to complete your registration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <CustomInput
                    name="privacy_consent"
                    label="Privacy Policy Agreement"
                    placeholder="I consent to the collection, storage, and use of my personal and health information as outlined in the Privacy Policy. I understand how my data will be used, who it may be shared with, and my rights regarding access, correction, and deletion of my data."
                    type="checkbox"
                    control={form.control}
                  />

                  <CustomInput
                    control={form.control}
                    type="checkbox"
                    name="service_consent"
                    label="Terms of Service Agreement"
                    placeholder="I agree to the Terms of Service, including my responsibilities as a user of this healthcare management system, the limitations of liability, and the dispute resolution process."
                  />

                  <CustomInput
                    control={form.control}
                    type="checkbox"
                    name="medical_consent"
                    label="Informed Consent for Medical Treatment"
                    placeholder="I provide informed consent to receive medical treatment and services through this healthcare management system. I acknowledge that I have been informed of the nature, risks, benefits, and alternatives to the proposed treatments."
                  />
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#046658] mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
              <p className="text-gray-600">Preparing your registration form</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-16 h-16 mr-4">
              <Image
                src="/logo.png"
                alt="Ihosi Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-[#3E4C4B] mb-2">
                {type === "create" ? "Patient Registration" : "Update Your Information"}
              </h1>
              <p className="text-sm text-[#5AC5C8] font-medium">
                Ihosi Healthcare Management System
              </p>
            </div>
          </div>
          <p className="text-lg text-[#3E4C4B]/80 max-w-2xl mx-auto">
            {type === "create" 
              ? "Please provide your information to create your patient profile and access our comprehensive healthcare services."
              : "Update your information to keep your medical records current and secure."
            }
          </p>
        </div>

        {/* Progress Steps */}
        {type === "create" && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 shadow-lg
                    ${currentStep >= step.id 
                      ? 'bg-gradient-to-br from-[#046658] to-[#2EB6B0] border-[#046658] text-white shadow-[#046658]/30' 
                      : 'bg-white border-[#D1F1F2] text-[#3E4C4B]/60 shadow-sm'
                    }
                  `}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-7 w-7" />
                    ) : (
                      <step.icon className="h-7 w-7" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-1 mx-2 transition-all duration-300 rounded-full
                      ${currentStep > step.id ? 'bg-gradient-to-r from-[#046658] to-[#2EB6B0]' : 'bg-[#D1F1F2]'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3E4C4B] mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-[#3E4C4B]/70 text-lg">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(
                  (data) => {
                    console.log("Form handleSubmit called with data:", data);
                    onSubmit(data);
                  },
                  (errors) => {
                    console.log("Form validation failed with errors:", errors);
                    console.log("Form state:", form.formState);
                  }
                )} 
                className="space-y-8"
              >
                {type === "create" ? renderStepContent() : (
                  <div className="space-y-8">
                    {renderStepContent()}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-[#D1F1F2]">
                  {type === "create" ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="flex items-center space-x-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#F5F7FA] hover:border-[#046658] transition-all duration-300"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </Button>

                      {currentStep < totalSteps ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="flex items-center space-x-2 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#046658]/90 hover:to-[#2EB6B0]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <span>Next</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex items-center space-x-2 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#046658]/90 hover:to-[#2EB6B0]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => {
                            console.log("Complete Registration button clicked");
                            console.log("Form errors:", form.formState.errors);
                            console.log("Form values:", form.getValues());
                          }}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Complete Registration</span>
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#046658]/90 hover:to-[#2EB6B0]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={async () => {
                        console.log("Update Information button clicked");
                        console.log("Form errors:", form.formState.errors);
                        console.log("Form values:", form.getValues());
                        console.log("User ID:", userId);
                        console.log("Type:", type);
                        
                        // Manual validation check
                        const isValid = await form.trigger();
                        console.log("Manual validation result:", isValid);
                        if (!isValid) {
                          console.log("Validation errors:", form.formState.errors);
                        }
                        
                        // Try to submit manually
                        const formData = form.getValues();
                        console.log("Attempting manual submission with data:", formData);
                      }}
                    >
                      {loading ? "Updating..." : "Update Information"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-8 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-[#D1F1F2]">
          <div className="flex items-center justify-center mb-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-[#046658] to-[#2EB6B0] text-white mr-3">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#3E4C4B]">Need Help?</h3>
          </div>
          <p className="text-[#3E4C4B]/70 mb-2">
            Our support team is here to assist you with any questions or concerns.
          </p>
          <p className="text-sm text-[#3E4C4B]/60">
            Contact us at{" "}
            <a href="mailto:services@bkgconsultants.com" className="text-[#046658] hover:text-[#2EB6B0] hover:underline font-medium transition-colors duration-300">
              services@bkgconsultants.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
