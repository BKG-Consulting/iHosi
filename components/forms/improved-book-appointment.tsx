"use client";

import { AppointmentSchema } from "@/lib/schema";
import { generateTimes } from "@/utils";
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
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { UserPen } from "lucide-react";
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

export const ImprovedBookAppointment = ({
  data,
  doctors,
}: {
  data: Patient;
  doctors: Doctor[];
}) => {
  const [loading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>(doctors);
  const [availableTimes, setAvailableTimes] = useState<{label: string, value: string}[]>([]);
  const router = useRouter();

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      doctor_id: "",
      appointment_date: "",
      time: "",
      type: "",
      note: "",
    },
  });

  // Clear form and reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setAvailableDoctors(doctors);
      setAvailableTimes([]);
    }
  };

  const patientName = `${data?.first_name} ${data?.last_name}`;

  // Watch for date changes to filter doctors and times
  const selectedDate = form.watch("appointment_date");
  const selectedTime = form.watch("time");

  // Helper function for placeholder text
  const getPlaceholderText = () => {
    if (!selectedDate) return "Select date first";
    if (!selectedTime) return "Select time first";
    return "Select a physician";
  };

  // Helper function for step indicator color
  const getStepIndicatorColor = () => {
    return selectedDate && selectedTime ? 'bg-[#046658]' : 'bg-[#D1F1F2]';
  };

  // Helper function for step indicator text
  const getStepIndicatorText = () => {
    if (!selectedDate || !selectedTime) {
      return <span className="text-xs text-[#3E4C4B]/60">(Complete previous steps)</span>;
    }
    return null;
  };

  // Filter available doctors based on selected date
  useEffect(() => {
    if (selectedDate) {
      filterAvailableDoctors(selectedDate);
    } else {
      setAvailableDoctors(doctors);
    }
  }, [selectedDate, doctors]);

  // Filter available times based on selected date and doctor
  useEffect(() => {
    if (selectedDate && selectedTime) {
      filterAvailableTimes(selectedDate, selectedTime);
    } else {
      setAvailableTimes(generateTimes(8, 17, 30));
    }
  }, [selectedDate, selectedTime]);

  const filterAvailableDoctors = async (date: string) => {
    try {
      const response = await fetch(`/api/doctors/available?date=${date}`);
      if (response.ok) {
        const result = await response.json();
        setAvailableDoctors(result.data || []);
      }
    } catch (error) {
      console.error('Error filtering doctors:', error);
      setAvailableDoctors(doctors);
    }
  };

  const filterAvailableTimes = async (date: string, time: string) => {
    try {
      const response = await fetch(`/api/doctors/available-times?date=${date}&time=${time}`);
      if (response.ok) {
        const result = await response.json();
        setAvailableTimes(result.data || generateTimes(8, 17, 30));
      }
    } catch (error) {
      console.error('Error filtering times:', error);
      setAvailableTimes(generateTimes(8, 17, 30));
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
        setIsOpen(false); // Close the modal
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
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center gap-2 justify-start text-sm font-medium bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#046658]/90 hover:to-[#2EB6B0]/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
        >
          <UserPen size={16} /> Book Appointment
        </Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl rounded-r-2xl md:h-p[95%] md:top-[2.5%] md:right-[1%] w-full bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#5AC5C8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <span className="text-[#3E4C4B] font-medium">Loading appointment booking...</span>
            </div>
          </div>
        ) : (
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

                <CustomInput
                  type="select"
                  selectList={TYPES}
                  control={form.control}
                  name="type"
                  label="Appointment Type"
                  placeholder="Select a appointment type"
                />

                {/* STEP 1: Select Date First */}
                <div className="space-y-2">
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="appointment_date"
                    placeholder=""
                    label="Select Date"
                    inputType="date"
                  />
                </div>

                {/* STEP 2: Select Time */}
                <div className="space-y-2">
                  <CustomInput
                    type="select"
                    control={form.control}
                    name="time"
                    placeholder="Select time"
                    label={`Select Time${!selectedDate ? ' (Select date first)' : ''}`}
                    selectList={availableTimes}
                    disabled={!selectedDate}
                  />
                </div>

                {/* STEP 3: Select Doctor (filtered by date/time) */}
                <FormField
                  control={form.control}
                  name="doctor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-[#3E4C4B] flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStepIndicatorColor()}`}></div>
                        Available Physicians
                        {getStepIndicatorText()}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting || !selectedDate || !selectedTime}
                      >
                        <FormControl>
                          <SelectTrigger className="border-[#D1F1F2] focus:border-[#2EB6B0] focus:ring-[#2EB6B0]/20">
                            <SelectValue placeholder={getPlaceholderText()} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-[#D1F1F2] bg-white/95 backdrop-blur-sm">
                          {availableDoctors?.length === 0 ? (
                            <div className="p-6 text-center">
                              <div className="w-12 h-12 bg-[#D1F1F2] rounded-full flex items-center justify-center mx-auto mb-3">
                                <UserPen className="w-6 h-6 text-[#3E4C4B]/60" />
                              </div>
                              <p className="text-[#3E4C4B]/70 font-medium">No doctors available</p>
                              <p className="text-[#3E4C4B]/50 text-sm">for selected date/time</p>
                            </div>
                          ) : (
                            availableDoctors?.map((doctor) => (
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
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="note"
                  placeholder="Additional note"
                  label="Additional Note"
                />

                <Button
                  disabled={isSubmitting || !selectedDate || !selectedTime || !form.watch("doctor_id")}
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
        )}
      </SheetContent>
    </Sheet>
  );
};
