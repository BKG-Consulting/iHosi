"use client";

import { AppointmentSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor, Patient } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { UserPen, ChevronRight } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { ProfileImage } from "../profile-image";
import { CustomInput } from "../custom-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";

const TYPES = [
  { label: "General Consultation", value: "General Consultation" },
  { label: "General Check up", value: "General Check Up" },
  { label: "Antenatal", value: "Antenatal" },
  { label: "Maternity", value: "Maternity" },
  { label: "Lab Test", value: "Lab Test" },
  { label: "ANT", value: "ANT" },
];

interface DashboardBookAppointmentProps {
  data: Patient;
  doctors: Doctor[];
  preSelectedDoctor?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DashboardBookAppointment = ({
  data,
  doctors,
  preSelectedDoctor,
  isOpen,
  onOpenChange,
}: DashboardBookAppointmentProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<{label: string, value: string}[]>([]);
  const router = useRouter();

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      doctor_id: preSelectedDoctor || "",
      appointment_date: "",
      time: "",
      type: "",
      note: "",
    },
  });

  // Clear form and reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setAvailableTimes([]);
    } else if (preSelectedDoctor) {
      // Set the pre-selected doctor when modal opens
      form.setValue("doctor_id", preSelectedDoctor);
    }
  }, [isOpen, preSelectedDoctor, form]);

  const patientName = `${data?.first_name} ${data?.last_name}`;

  // Watch for doctor and date changes
  const selectedDoctor = form.watch("doctor_id");
  const selectedDate = form.watch("appointment_date");
  const selectedTime = form.watch("time");

  // Load available times when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableTimes(selectedDoctor, selectedDate);
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDoctor, selectedDate]);

  const loadAvailableTimes = async (doctorId: string, date: string) => {
    try {
      console.log('🔍 Loading available times for:', { doctorId, date });
      
      const response = await fetch(`/api/scheduling/availability/slots?doctorId=${doctorId}&date=${date}`);
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📅 Raw API response:', result);
        
        const timeSlots = result.data?.filter((slot: any) => slot.available) || [];
        console.log('✅ Available time slots:', timeSlots);
        console.log('📊 Total available slots:', timeSlots.length);
        
        setAvailableTimes(timeSlots.map((slot: any) => ({
          label: slot.time,
          value: slot.time
        })));
      } else {
        console.log('❌ API Error:', response.status, response.statusText);
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error('💥 Error loading available times:', error);
      setAvailableTimes([]);
    }
  };

  const onSubmit: SubmitHandler<z.infer<typeof AppointmentSchema>> = async (
    values
  ) => {
    try {
      setIsSubmitting(true);
      const newData = { ...values, patient_id: data?.id };

      const res = await createNewAppointment(newData);

      if (res.success) {
        form.reset({});
        onOpenChange(false); // Close the modal
        router.refresh(); // Refresh the page to show the new appointment
        toast.success("Appointment request submitted successfully! You will receive a confirmation email once the doctor reviews your request.");
      } else {
        toast.error(res.msg || "Failed to create appointment");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="rounded-xl rounded-r-2xl md:h-[95%] md:top-[2.5%] md:right-[1%] w-full bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA]">
        <div className="h-full overflow-y-auto p-4">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-[#3E4C4B] flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-lg flex items-center justify-center">
                <UserPen className="w-4 h-4 text-white" />
              </div>
              Book Appointment
            </SheetTitle>
            <p className="text-[#3E4C4B]/80 text-sm">Select your preferred date, time, and physician</p>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 mt-5 2xl:mt-10"
            >
              {/* Patient Info Card */}
              <div className="w-full rounded-lg border border-[#D1F1F2] bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                <ProfileImage
                  url={data?.img!}
                  name={patientName}
                  className="size-16 border-2 border-[#D1F1F2] shadow-sm"
                  bgColor={data?.colorCode!}
                />

                <div>
                  <p className="font-semibold text-lg text-[#3E4C4B]">{patientName}</p>
                  <span className="text-sm text-[#3E4C4B]/70 capitalize">
                    {data?.gender}
                  </span>
                </div>
              </div>

              {/* Appointment Type */}
              <CustomInput
                type="select"
                selectList={TYPES}
                control={form.control}
                name="type"
                label="Appointment Type"
                placeholder="Select appointment type"
              />

              {/* STEP 1: Select Doctor First */}
              <FormField
                control={form.control}
                name="doctor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#3E4C4B] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#046658]"></div>
                      Select Doctor First
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="border-[#D1F1F2] focus:border-[#2EB6B0] focus:ring-[#2EB6B0]/20">
                          <SelectValue placeholder="Choose a doctor to see their available times" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-[#D1F1F2] bg-white/95 backdrop-blur-sm">
                        {doctors?.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id} className="p-3 hover:bg-[#D1F1F2]/50 focus:bg-[#D1F1F2]/50">
                            <div className="flex flex-row gap-3 p-2">
                              <ProfileImage
                                url={doctor?.img || undefined}
                                name={doctor?.name}
                                bgColor={doctor?.colorCode || undefined}
                                textClassName="text-black"
                                className="border border-[#D1F1F2]"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-start text-[#3E4C4B]">
                                  {doctor.name}
                                </p>
                                <span className="text-sm text-[#3E4C4B]/70">
                                  {doctor?.specialization}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-[#046658] rounded-full"></div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* STEP 2: Select Date */}
              <div className="space-y-2">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="appointment_date"
                  placeholder=""
                  label={`Select Date${!selectedDoctor ? ' (Select doctor first)' : ''}`}
                  inputType="date"
                  disabled={!selectedDoctor}
                />
              </div>

              {/* STEP 3: Select Time */}
              <div className="space-y-2">
                <CustomInput
                  type="select"
                  control={form.control}
                  name="time"
                  placeholder="Select time"
                  label={`Select Time${!selectedDoctor || !selectedDate ? ' (Complete previous steps)' : ''}`}
                  selectList={availableTimes}
                  disabled={!selectedDoctor || !selectedDate}
                />
                {selectedDoctor && selectedDate && availableTimes.length === 0 && (
                  <p className="text-xs text-[#3E4C4B]/60">
                    No available time slots for this doctor on the selected date
                  </p>
                )}
              </div>

              {/* Additional Note */}
              <CustomInput
                type="textarea"
                control={form.control}
                name="note"
                placeholder="Additional note"
                label="Additional Note"
              />

              {/* Submit Button */}
              <Button
                disabled={isSubmitting || !selectedDoctor || !selectedDate || !selectedTime}
                type="submit"
                className="w-full bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#046658]/90 hover:to-[#2EB6B0]/90 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Appointment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPen className="w-4 h-4" />
                    Book Appointment
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

