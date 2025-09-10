"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PreAppointmentSchema = z.object({
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  historyPresentIllness: z.string().min(10, "Please provide more details about your symptoms"),
  currentMedications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    route: z.string().optional()
  })).optional(),
  allergies: z.array(z.object({
    type: z.enum(["drug", "food", "environmental", "other"]),
    name: z.string(),
    severity: z.enum(["mild", "moderate", "severe", "life-threatening"]),
    reaction: z.string()
  })).optional(),
  familyHistory: z.string().optional(),
  socialHistory: z.string().optional(),
  painScale: z.number().min(0).max(10).optional(),
  symptomsDuration: z.string().optional(),
  severity: z.enum(["mild", "moderate", "severe"]).optional(),
  triggers: z.string().optional(),
  relievingFactors: z.string().optional(),
  associatedSymptoms: z.string().optional(),
  reviewOfSystems: z.object({
    constitutional: z.boolean().optional(),
    cardiovascular: z.boolean().optional(),
    respiratory: z.boolean().optional(),
    gastrointestinal: z.boolean().optional(),
    genitourinary: z.boolean().optional(),
    musculoskeletal: z.boolean().optional(),
    neurological: z.boolean().optional(),
    psychiatric: z.boolean().optional(),
    dermatological: z.boolean().optional(),
    endocrine: z.boolean().optional()
  }).optional()
});

type PreAppointmentFormData = z.infer<typeof PreAppointmentSchema>;

interface PreAppointmentQuestionnaireProps {
  appointmentId: number;
  patientId: string;
  onComplete: (data: PreAppointmentFormData) => void;
  onCancel: () => void;
}

export function PreAppointmentQuestionnaire({ 
  appointmentId, 
  patientId, 
  onComplete, 
  onCancel 
}: PreAppointmentQuestionnaireProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMedications, setCurrentMedications] = useState<Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
  }>>([]);
  const [allergies, setAllergies] = useState<Array<{
    type: "drug" | "food" | "environmental" | "other";
    name: string;
    severity: "mild" | "moderate" | "severe" | "life-threatening";
    reaction: string;
  }>>([]);

  const form = useForm<PreAppointmentFormData>({
    resolver: zodResolver(PreAppointmentSchema),
    defaultValues: {
      chiefComplaint: "",
      historyPresentIllness: "",
      currentMedications: [],
      allergies: [],
      familyHistory: "",
      socialHistory: "",
      painScale: undefined,
      symptomsDuration: "",
      severity: undefined,
      triggers: "",
      relievingFactors: "",
      associatedSymptoms: "",
      reviewOfSystems: {}
    }
  });

  const addMedication = () => {
    setCurrentMedications([...currentMedications, {
      name: "",
      dosage: "",
      frequency: "",
      route: ""
    }]);
  };

  const removeMedication = (index: number) => {
    setCurrentMedications(currentMedications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = [...currentMedications];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentMedications(updated);
  };

  const addAllergy = () => {
    setAllergies([...allergies, {
      type: "drug",
      name: "",
      severity: "mild",
      reaction: ""
    }]);
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const updateAllergy = (index: number, field: string, value: string) => {
    const updated = [...allergies];
    updated[index] = { ...updated[index], [field]: value };
    setAllergies(updated);
  };

  const onSubmit = async (data: PreAppointmentFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData = {
        ...data,
        currentMedications,
        allergies
      };

      // Here you would typically save to the database
      console.log("Pre-appointment questionnaire data:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Pre-appointment questionnaire completed successfully!");
      onComplete(formData);
      
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      toast.error("Failed to submit questionnaire. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Pre-Appointment Health Questionnaire
          </CardTitle>
          <CardDescription>
            Please complete this questionnaire before your appointment to help us provide the best care.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Chief Complaint */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Primary Concern</h3>
                <FormField
                  control={form.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your main reason for today's visit? *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your main concern or symptoms..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* History of Present Illness */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Symptom Details</h3>
                <FormField
                  control={form.control}
                  name="historyPresentIllness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please describe your symptoms in detail *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="When did symptoms start? How have they changed? What makes them better or worse?"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="symptomsDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How long have you had these symptoms?</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3 days, 2 weeks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="painScale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pain Level (0-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            placeholder="0 = no pain, 10 = worst pain"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="triggers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What triggers or worsens your symptoms?</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., certain foods, activities, weather..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relievingFactors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What helps relieve your symptoms?</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., rest, medication, heat..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Current Medications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
                
                {currentMedications.map((med, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Medication {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Medication name"
                        value={med.name}
                        onChange={(e) => updateMedication(index, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Dosage (e.g., 10mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      />
                      <Input
                        placeholder="Frequency (e.g., twice daily)"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      />
                      <Input
                        placeholder="Route (e.g., oral, topical)"
                        value={med.route}
                        onChange={(e) => updateMedication(index, "route", e.target.value)}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Allergies */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addAllergy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Allergy
                  </Button>
                </div>
                
                {allergies.map((allergy, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Allergy {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAllergy(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        value={allergy.type}
                        onValueChange={(value) => updateAllergy(index, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Allergy type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="drug">Drug</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Allergen name"
                        value={allergy.name}
                        onChange={(e) => updateAllergy(index, "name", e.target.value)}
                      />
                      <Select
                        value={allergy.severity}
                        onValueChange={(value) => updateAllergy(index, "severity", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                          <SelectItem value="life-threatening">Life-threatening</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Reaction description"
                        value={allergy.reaction}
                        onChange={(e) => updateAllergy(index, "reaction", e.target.value)}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Family History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Family History</h3>
                <FormField
                  control={form.control}
                  name="familyHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please list any significant family medical history</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., diabetes, heart disease, cancer, mental health conditions..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Social History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Social History</h3>
                <FormField
                  control={form.control}
                  name="socialHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please provide information about your lifestyle</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., smoking, alcohol use, exercise habits, occupation, stress levels..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Review of Systems */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Review of Systems</h3>
                <p className="text-sm text-gray-600">Please check any symptoms you are currently experiencing:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "constitutional", label: "Constitutional (fever, weight loss, fatigue)" },
                    { key: "cardiovascular", label: "Cardiovascular (chest pain, palpitations)" },
                    { key: "respiratory", label: "Respiratory (cough, shortness of breath)" },
                    { key: "gastrointestinal", label: "Gastrointestinal (nausea, vomiting, diarrhea)" },
                    { key: "genitourinary", label: "Genitourinary (urinary symptoms)" },
                    { key: "musculoskeletal", label: "Musculoskeletal (joint pain, muscle aches)" },
                    { key: "neurological", label: "Neurological (headaches, dizziness)" },
                    { key: "psychiatric", label: "Psychiatric (anxiety, depression)" },
                    { key: "dermatological", label: "Dermatological (skin changes, rashes)" },
                    { key: "endocrine", label: "Endocrine (thirst, frequent urination)" }
                  ].map((system) => (
                    <div key={system.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={system.key}
                        checked={form.watch(`reviewOfSystems.${system.key}` as any) || false}
                        onCheckedChange={(checked) => {
                          form.setValue(`reviewOfSystems.${system.key}` as any, checked as boolean);
                        }}
                      />
                      <label htmlFor={system.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {system.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Complete Questionnaire"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

