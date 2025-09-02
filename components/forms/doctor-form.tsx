"use client";

import { DoctorSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Plus, User, Briefcase, Phone, Calendar } from "lucide-react";
import { Form } from "../ui/form";
import { CustomInput, SwitchInput } from "../custom-input";
import { SPECIALIZATION } from "@/utils/seetings";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { createNewDoctor } from "@/app/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const TYPES = [
  { label: "Full-Time", value: "FULL" },
  { label: "Part-Time", value: "PART" },
];

const WORKING_DAYS = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Portuguese"
];

type Day = {
  day: string;
  start_time?: string;
  close_time?: string;
  is_working?: boolean;
  break_start?: string;
  break_end?: string;
  max_appointments?: number;
  appointment_duration?: number;
};

export const DoctorForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [workSchedule, setWorkSchedule] = useState<Day[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof DoctorSchema>>({
    resolver: zodResolver(DoctorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialization: "",
      address: "",
      type: "FULL",
      department: "",
      img: "",
      password: "",
      license_number: "",
      emergency_contact: "",
      emergency_phone: "",
      qualifications: "",
      experience_years: 0,
      languages: [],
      consultation_fee: 0,
      max_patients_per_day: 20,
      preferred_appointment_duration: 30,
    },
  });

  const handleSubmit = async (values: z.infer<typeof DoctorSchema>) => {
    try {
      if (workSchedule.length === 0) {
        toast.error("Please select work schedule");
        return;
      }

      setIsLoading(true);
      const resp = await createNewDoctor({
        ...values,
        languages: selectedLanguages,
        work_schedule: workSchedule,
      });

      if (resp.success) {
        toast.success("Doctor added successfully!");
        setWorkSchedule([]);
        setSelectedLanguages([]);
        form.reset();
        router.refresh();
      } else if (resp.error) {
        toast.error(resp.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSpecialization = form.watch("specialization");

  useEffect(() => {
    if (selectedSpecialization) {
      const department = SPECIALIZATION.find(
        (el) => el.value === selectedSpecialization
      );

      if (department) {
        form.setValue("department", department.department);
      }
    }
  }, [selectedSpecialization, form]);

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
          <Plus size={20} className="mr-2" />
          Add Doctor
        </Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl rounded-r-xl md:h-[95%] md:top-[2.5%] md:right-[1%] w-full overflow-y-scroll">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-2xl font-bold text-gray-900">Add New Doctor</SheetTitle>
          <p className="text-sm text-gray-600">Register a new healthcare professional</p>
        </SheetHeader>

        <div className="py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CustomInput
                    type="radio"
                    selectList={TYPES}
                    control={form.control}
                    name="type"
                    label="Employment Type"
                    placeholder=""
                    defaultValue="FULL"
                  />

                  <CustomInput
                    type="input"
                    control={form.control}
                    name="name"
                    placeholder="Doctor's full name"
                    label="Full Name"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                      type="select"
                      control={form.control}
                      name="specialization"
                      placeholder="Select specialization"
                      label="Specialization"
                      selectList={SPECIALIZATION}
                    />
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="department"
                      placeholder="Department"
                      label="Department"
                    />
                  </div>

                  <CustomInput
                    type="input"
                    control={form.control}
                    name="license_number"
                    placeholder="Medical License Number"
                    label="License Number"
                  />
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Contact number"
                      label="Contact Number"
                    />
                  </div>

                  <CustomInput
                    type="input"
                    control={form.control}
                    name="address"
                    placeholder="Full address"
                    label="Address"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="emergency_contact"
                      placeholder="Emergency contact name"
                      label="Emergency Contact"
                    />
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="emergency_phone"
                      placeholder="Emergency phone"
                      label="Emergency Phone"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="qualifications"
                    placeholder="Medical degrees and certifications"
                    label="Qualifications"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="experience_years"
                      placeholder="Years of experience"
                      label="Experience (Years)"
                    />
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="consultation_fee"
                      placeholder="Consultation fee"
                      label="Consultation Fee ($)"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Languages Spoken</Label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map((language) => (
                        <span
                          key={language}
                          className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all ${
                            selectedLanguages.includes(language)
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                          }`}
                          onClick={() => toggleLanguage(language)}
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling & Capacity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Scheduling & Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="max_patients_per_day"
                      placeholder="Maximum patients per day"
                      label="Max Patients/Day"
                    />
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="preferred_appointment_duration"
                      placeholder="Appointment duration in minutes"
                      label="Appointment Duration (min)"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Working Days & Schedule</Label>
                    <SwitchInput
                      data={WORKING_DAYS}
                      setWorkSchedule={setWorkSchedule}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-red-600" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="password"
                    placeholder="Create a secure password"
                    label="Password"
                    inputType="password"
                  />
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold shadow-lg"
              >
                {isLoading ? "Creating Doctor..." : "Create Doctor Account"}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
