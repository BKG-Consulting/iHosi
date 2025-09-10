"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  ShieldCheck, 
  User, 
  Stethoscope, 
  FileText, 
  Pill, 
  Microscope,
  Camera,
  Users,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { DataCategory, MedicalActionType } from "@/lib/granular-consent-management";

const AppointmentConsentSchema = z.object({
  dataCategories: z.array(z.string()).min(1, "Please select at least one data category"),
  medicalActions: z.array(z.string()).min(1, "Please select at least one medical action"),
  consentDuration: z.enum(["appointment_only", "30_days", "90_days", "1_year"]),
  allowEmergencyAccess: z.boolean().default(true),
  allowDataSharing: z.boolean().default(false),
  allowResearchUse: z.boolean().default(false),
  restrictions: z.string().optional(),
  digitalSignature: z.boolean().refine((val) => val === true, {
    message: "Digital signature is required"
  })
});

type AppointmentConsentFormData = z.infer<typeof AppointmentConsentSchema>;

interface AppointmentConsentWorkflowProps {
  appointmentId: number;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  onComplete: (consentData: AppointmentConsentFormData) => void;
  onCancel: () => void;
}

export function AppointmentConsentWorkflow({
  appointmentId,
  patientId,
  doctorId,
  doctorName,
  doctorSpecialty,
  onComplete,
  onCancel
}: AppointmentConsentWorkflowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<AppointmentConsentFormData>({
    resolver: zodResolver(AppointmentConsentSchema),
    defaultValues: {
      dataCategories: [],
      medicalActions: [],
      consentDuration: "appointment_only",
      allowEmergencyAccess: true,
      allowDataSharing: false,
      allowResearchUse: false,
      restrictions: "",
      digitalSignature: false
    }
  });

  const dataCategories = [
    {
      id: DataCategory.DEMOGRAPHICS,
      label: "Demographics",
      description: "Name, age, gender, contact information",
      icon: User,
      required: true
    },
    {
      id: DataCategory.MEDICAL_HISTORY,
      label: "Medical History",
      description: "Past illnesses, surgeries, chronic conditions",
      icon: FileText,
      required: true
    },
    {
      id: DataCategory.ALLERGIES,
      label: "Allergies",
      description: "Drug allergies, food allergies, environmental allergies",
      icon: AlertTriangle,
      required: true
    },
    {
      id: DataCategory.MEDICATIONS,
      label: "Current Medications",
      description: "Prescription and over-the-counter medications",
      icon: Pill,
      required: true
    },
    {
      id: DataCategory.VITAL_SIGNS,
      label: "Vital Signs",
      description: "Blood pressure, heart rate, temperature, weight",
      icon: Stethoscope,
      required: true
    },
    {
      id: DataCategory.LAB_RESULTS,
      label: "Lab Results",
      description: "Blood tests, urine tests, other laboratory results",
      icon: Microscope,
      required: false
    },
    {
      id: DataCategory.IMAGING_RESULTS,
      label: "Imaging Results",
      description: "X-rays, CT scans, MRI, ultrasound results",
      icon: Camera,
      required: false
    },
    {
      id: DataCategory.DIAGNOSES,
      label: "Diagnoses",
      description: "Medical diagnoses and conditions",
      icon: FileText,
      required: true
    },
    {
      id: DataCategory.TREATMENT_PLANS,
      label: "Treatment Plans",
      description: "Treatment recommendations and care plans",
      icon: FileText,
      required: true
    },
    {
      id: DataCategory.PRESCRIPTIONS,
      label: "Prescriptions",
      description: "Medication prescriptions and refills",
      icon: Pill,
      required: true
    }
  ];

  const medicalActions = [
    {
      id: MedicalActionType.VIEW_MEDICAL_RECORDS,
      label: "View Medical Records",
      description: "Access your medical history and records",
      icon: FileText,
      required: true
    },
    {
      id: MedicalActionType.WRITE_DIAGNOSIS,
      label: "Write Diagnoses",
      description: "Record medical diagnoses and conditions",
      icon: FileText,
      required: true
    },
    {
      id: MedicalActionType.PRESCRIBE_MEDICATION,
      label: "Prescribe Medications",
      description: "Prescribe and manage your medications",
      icon: Pill,
      required: true
    },
    {
      id: MedicalActionType.ORDER_LAB_TESTS,
      label: "Order Lab Tests",
      description: "Order laboratory tests and procedures",
      icon: Microscope,
      required: false
    },
    {
      id: MedicalActionType.ORDER_IMAGING,
      label: "Order Imaging",
      description: "Order X-rays, CT scans, MRI, and other imaging",
      icon: Camera,
      required: false
    },
    {
      id: MedicalActionType.REFER_TO_SPECIALIST,
      label: "Refer to Specialists",
      description: "Refer you to other medical specialists",
      icon: Users,
      required: false
    },
    {
      id: MedicalActionType.SHARE_WITH_OTHER_DOCTORS,
      label: "Share with Other Doctors",
      description: "Share your information with other healthcare providers",
      icon: Users,
      required: false
    }
  ];

  const onSubmit = async (data: AppointmentConsentFormData) => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call to save consent
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Appointment consent data:", data);
      onComplete(data);
      
    } catch (error) {
      console.error("Error submitting consent:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Consent for Medical Care</h3>
              <p className="text-gray-600">
                Dr. {doctorName} ({doctorSpecialty}) needs your consent to provide medical care.
              </p>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> This consent allows your doctor to access your health information 
                and provide medical care. You can modify or revoke this consent at any time.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-medium">What this consent covers:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Access to your medical records for treatment purposes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Ability to diagnose and treat your medical conditions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Prescription of medications as needed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Ordering of lab tests and imaging studies
                </li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Data Categories</h3>
              <p className="text-gray-600 mb-4">
                Select which types of your health information Dr. {doctorName} can access:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <FormField
                          control={form.control}
                          name="dataCategories"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, category.id]);
                                    } else {
                                      field.onChange(currentValues.filter((v: string) => v !== category.id));
                                    }
                                  }}
                                  disabled={category.required}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{category.label}</span>
                            {category.required && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Medical Actions</h3>
              <p className="text-gray-600 mb-4">
                Select which medical actions Dr. {doctorName} can perform:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicalActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card key={action.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <FormField
                          control={form.control}
                          name="medicalActions"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(action.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, action.id]);
                                    } else {
                                      field.onChange(currentValues.filter((v: string) => v !== action.id));
                                    }
                                  }}
                                  disabled={action.required}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{action.label}</span>
                            {action.required && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Consent Duration & Preferences</h3>
              <p className="text-gray-600 mb-4">
                Set how long this consent will remain active:
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="consentDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consent Duration</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: "appointment_only", label: "This Appointment Only", desc: "Consent expires after today's visit" },
                          { value: "30_days", label: "30 Days", desc: "Consent expires in 30 days" },
                          { value: "90_days", label: "90 Days", desc: "Consent expires in 90 days" },
                          { value: "1_year", label: "1 Year", desc: "Consent expires in 1 year" }
                        ].map((option) => (
                          <Card 
                            key={option.value}
                            className={`cursor-pointer transition-colors ${
                              field.value === option.value 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => field.onChange(option.value)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  checked={field.value === option.value}
                                  onChange={() => field.onChange(option.value)}
                                  className="h-4 w-4"
                                />
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-sm text-gray-600">{option.desc}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h4 className="font-medium">Additional Permissions</h4>
                
                <FormField
                  control={form.control}
                  name="allowEmergencyAccess"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow Emergency Access</FormLabel>
                        <p className="text-sm text-gray-600">
                          Allow access to your information in emergency situations
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowDataSharing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow Data Sharing</FormLabel>
                        <p className="text-sm text-gray-600">
                          Allow sharing your information with other healthcare providers
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowResearchUse"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow Research Use</FormLabel>
                        <p className="text-sm text-gray-600">
                          Allow your anonymized data to be used for medical research
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="restrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Restrictions (Optional)</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Any specific restrictions or concerns about your care..."
                        className="w-full p-3 border border-gray-300 rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Consent Management - Step {currentStep} of {totalSteps}
          </CardTitle>
          <CardDescription>
            Grant consent for Dr. {doctorName} to provide your medical care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}

              {/* Digital Signature Step */}
              {currentStep === totalSteps && (
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium">Digital Signature</h4>
                  <p className="text-sm text-gray-600">
                    By checking this box, you digitally sign this consent form and agree to the terms.
                  </p>
                  <FormField
                    control={form.control}
                    name="digitalSignature"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I understand and agree to the terms of this consent
                          </FormLabel>
                          <p className="text-sm text-gray-600">
                            This serves as my digital signature
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 1 ? onCancel : prevStep}
                >
                  {currentStep === 1 ? 'Cancel' : 'Previous'}
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Grant Consent'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

