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
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Heart, Thermometer, Activity, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const NursingAssessmentSchema = z.object({
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  vitalSigns: z.object({
    temperature: z.number().min(95).max(110),
    systolic: z.number().min(70).max(250),
    diastolic: z.number().min(40).max(150),
    heartRate: z.number().min(40).max(200),
    respiratoryRate: z.number().min(8).max(40),
    oxygenSaturation: z.number().min(70).max(100),
    weight: z.number().min(50).max(500),
    height: z.number().min(36).max(84)
  }),
  painAssessment: z.object({
    scale: z.number().min(0).max(10),
    location: z.string().optional(),
    quality: z.string().optional(),
    duration: z.string().optional()
  }),
  medicationReconciliation: z.object({
    currentMedications: z.array(z.string()).optional(),
    adherence: z.enum(["excellent", "good", "fair", "poor"]).optional(),
    sideEffects: z.string().optional()
  }),
  allergyVerification: z.object({
    confirmed: z.boolean(),
    reactions: z.string().optional()
  }),
  preConsultationNotes: z.string().optional()
});

type NursingAssessmentFormData = z.infer<typeof NursingAssessmentSchema>;

interface NursingAssessmentProps {
  appointmentId: number;
  patientId: string;
  patientName: string;
  onComplete: (data: NursingAssessmentFormData) => void;
  onCancel: () => void;
}

export function NursingAssessment({ 
  appointmentId, 
  patientId, 
  patientName,
  onComplete, 
  onCancel 
}: NursingAssessmentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NursingAssessmentFormData>({
    resolver: zodResolver(NursingAssessmentSchema),
    defaultValues: {
      chiefComplaint: "",
      vitalSigns: {
        temperature: 98.6,
        systolic: 120,
        diastolic: 80,
        heartRate: 72,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        weight: 150,
        height: 68
      },
      painAssessment: {
        scale: 0,
        location: "",
        quality: "",
        duration: ""
      },
      medicationReconciliation: {
        currentMedications: [],
        adherence: "good",
        sideEffects: ""
      },
      allergyVerification: {
        confirmed: false,
        reactions: ""
      },
      preConsultationNotes: ""
    }
  });

  const onSubmit = async (data: NursingAssessmentFormData) => {
    try {
      setIsSubmitting(true);
      
      console.log("Nursing assessment data:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Nursing assessment completed successfully!");
      onComplete(data);
      
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVitalSignsStatus = (vitals: any) => {
    const status = [];
    
    // Temperature
    if (vitals.temperature < 97 || vitals.temperature > 100.4) {
      status.push({ type: "temperature", level: "warning", message: "Temperature outside normal range" });
    }
    
    // Blood Pressure
    if (vitals.systolic > 140 || vitals.diastolic > 90) {
      status.push({ type: "bp", level: "danger", message: "Elevated blood pressure" });
    } else if (vitals.systolic > 120 || vitals.diastolic > 80) {
      status.push({ type: "bp", level: "warning", message: "Pre-hypertensive" });
    }
    
    // Heart Rate
    if (vitals.heartRate < 60 || vitals.heartRate > 100) {
      status.push({ type: "hr", level: "warning", message: "Heart rate outside normal range" });
    }
    
    // Oxygen Saturation
    if (vitals.oxygenSaturation < 95) {
      status.push({ type: "spo2", level: "danger", message: "Low oxygen saturation" });
    }
    
    return status;
  };

  const vitalSignsStatus = getVitalSignsStatus(form.watch("vitalSigns"));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            Nursing Assessment - {patientName}
          </CardTitle>
          <CardDescription>
            Complete the pre-consultation assessment for this patient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Chief Complaint */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Chief Complaint</h3>
                <FormField
                  control={form.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary reason for today's visit *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Patient's main concern or symptoms..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vital Signs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
                  {vitalSignsStatus.length > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {vitalSignsStatus.length} Alert{vitalSignsStatus.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="vitalSigns.temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4" />
                          Temperature (°F)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.systolic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          Systolic (mmHg)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.diastolic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diastolic (mmHg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.heartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          Heart Rate (bpm)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.respiratoryRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Respiratory Rate (breaths/min)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.oxygenSaturation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Oxygen Saturation (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Vital Signs Alerts */}
                {vitalSignsStatus.length > 0 && (
                  <div className="space-y-2">
                    {vitalSignsStatus.map((status, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md ${
                          status.level === "danger" 
                            ? "bg-red-50 border border-red-200 text-red-800" 
                            : "bg-yellow-50 border border-yellow-200 text-yellow-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">{status.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pain Assessment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pain Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="painAssessment.scale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pain Scale (0-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="painAssessment.location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., lower back, chest" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="painAssessment.quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., sharp, dull, burning" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="painAssessment.duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., constant, intermittent" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Medication Reconciliation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Medication Reconciliation</h3>
                <FormField
                  control={form.control}
                  name="medicationReconciliation.adherence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Adherence</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select adherence level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent (100%)</SelectItem>
                          <SelectItem value="good">Good (80-99%)</SelectItem>
                          <SelectItem value="fair">Fair (60-79%)</SelectItem>
                          <SelectItem value="poor">Poor (&lt;60%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicationReconciliation.sideEffects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Side Effects or Concerns</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any side effects or medication concerns reported by patient..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Allergy Verification */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Allergy Verification</h3>
                <FormField
                  control={form.control}
                  name="allergyVerification.confirmed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allergies confirmed with patient</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergyVerification.reactions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergic Reactions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Document any allergic reactions reported..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pre-Consultation Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pre-Consultation Notes</h3>
                <FormField
                  control={form.control}
                  name="preConsultationNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes for Doctor</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional observations or concerns to share with the doctor..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Complete Assessment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

