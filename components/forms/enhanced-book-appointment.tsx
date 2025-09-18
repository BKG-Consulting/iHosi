"use client";

import { AppointmentSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor, Patient } from "@prisma/client";
import { Appointment } from "@/types/schedule-types";
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
import { UserPen, Clock, AlertCircle, CheckCircle, Calendar } from "lucide-react";
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
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

const TYPES = [
  { label: "General Consultation", value: "General Consultation" },
  { label: "General Check up", value: "General Check Up" },
  { label: "Antenatal", value: "Antenatal" },
  { label: "Maternity", value: "Maternity" },
  { label: "Lab Test", value: "Lab Test" },
  { label: "ANT", value: "ANT" },
];

interface DoctorSchedule {
  workingHours: Array<{
    day: string;
    isWorking: boolean;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
    maxAppointments: number;
    appointmentDuration: number;
    bufferTime: number;
  }>;
}

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export const EnhancedBookAppointment = ({
  data,
  doctors,
}: {
  data: Patient;
  doctors: Doctor[];
}) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [doctorSchedule, setDoctorSchedule] = useState<DoctorSchedule | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [validationType, setValidationType] = useState<"success" | "error" | "warning">("success");
  const [suggestions, setSuggestions] = useState<Array<{date: string; time: string; available: boolean; reason?: string; priority: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const patientName = `${data?.first_name} ${data?.last_name}`;

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

  // Watch for doctor and date changes
  const watchedDoctor = form.watch("doctor_id");
  const watchedDate = form.watch("appointment_date");

  // Load doctor schedule when doctor is selected
  useEffect(() => {
    if (watchedDoctor) {
      const doctor = doctors.find(d => d.id === watchedDoctor);
      setSelectedDoctor(doctor || null);
      loadDoctorSchedule(watchedDoctor);
    } else {
      setSelectedDoctor(null);
      setDoctorSchedule(null);
      setAvailableTimeSlots([]);
    }
  }, [watchedDoctor, doctors]);

  // Generate available time slots when date is selected
  useEffect(() => {
    if (watchedDate && doctorSchedule) {
      generateAvailableTimeSlots(watchedDate, doctorSchedule);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [watchedDate, doctorSchedule]);

  const loadDoctorSchedule = async (doctorId: string) => {
    try {
      setScheduleLoading(true);
      setValidationMessage("");
      
      const response = await fetch(`/api/doctors/${doctorId}/schedule`);
      if (response.ok) {
        const scheduleData = await response.json();
        setDoctorSchedule(scheduleData.data);
        setValidationMessage("Doctor schedule loaded successfully");
        setValidationType("success");
      } else {
        setValidationMessage("Unable to load doctor schedule");
        setValidationType("error");
      }
    } catch (error) {
      console.error("Error loading doctor schedule:", error);
      setValidationMessage("Error loading doctor schedule");
      setValidationType("error");
    } finally {
      setScheduleLoading(false);
    }
  };

  const generateAvailableTimeSlots = async (date: string, schedule: DoctorSchedule) => {
    try {
      setScheduleLoading(true);
      
      const appointmentDate = new Date(date);
      const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Find working day for the selected date
      const workingDay = schedule.workingHours.find(day => 
        day.day.toLowerCase() === dayOfWeek.toLowerCase() && day.isWorking
      );

      if (!workingDay) {
        setAvailableTimeSlots([]);
        setValidationMessage(`Doctor is not available on ${dayOfWeek}`);
        setValidationType("warning");
        return;
      }

      // Generate time slots based on doctor's schedule
      const slots: TimeSlot[] = [];
      const [startHour, startMinute] = workingDay.startTime.split(':').map(Number);
      const [endHour, endMinute] = workingDay.endTime.split(':').map(Number);
      const [breakStartHour, breakStartMinute] = workingDay.breakStart?.split(':').map(Number) || [0, 0];
      const [breakEndHour, breakEndMinute] = workingDay.breakEnd?.split(':').map(Number) || [0, 0];
      
      const slotDuration = workingDay.appointmentDuration + workingDay.bufferTime;
      
      let currentTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      const breakStartTime = workingDay.breakStart ? breakStartHour * 60 + breakStartMinute : 0;
      const breakEndTime = workingDay.breakEnd ? breakEndHour * 60 + breakEndMinute : 0;

      while (currentTime + slotDuration <= endTime) {
        const slotHour = Math.floor(currentTime / 60);
        const slotMinute = currentTime % 60;
        const timeString = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
        
        // Check if slot conflicts with break time
        const isDuringBreak = workingDay.breakStart && workingDay.breakEnd && 
          currentTime >= breakStartTime && currentTime < breakEndTime;
        
        // Check if slot is available (we'll check existing appointments)
        const isAvailable = !isDuringBreak;
        
        slots.push({
          time: timeString,
          available: isAvailable,
          reason: isDuringBreak ? "Break time" : undefined
        });
        
        currentTime += slotDuration;
      }

      // Check for existing appointments
      const existingAppointments = await checkExistingAppointments(selectedDoctor!.id, date);
      const finalSlots = slots.map(slot => {
        const isBooked = existingAppointments.some((apt: Appointment) => apt.time === slot.time);
        return {
          ...slot,
          available: slot.available && !isBooked,
          reason: isBooked ? "Already booked" : slot.reason
        };
      });

      setAvailableTimeSlots(finalSlots);
      
      const availableCount = finalSlots.filter(slot => slot.available).length;
      if (availableCount === 0) {
        setValidationMessage("No available time slots for this date");
        setValidationType("warning");
      } else {
        setValidationMessage(`${availableCount} time slots available`);
        setValidationType("success");
      }
      
    } catch (error) {
      console.error("Error generating time slots:", error);
      setValidationMessage("Error generating time slots");
      setValidationType("error");
    } finally {
      setScheduleLoading(false);
    }
  };

  const checkExistingAppointments = async (doctorId: string, date: string) => {
    try {
      const response = await fetch(`/api/scheduling/availability/slots?doctorId=${doctorId}&date=${date}`);
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error checking existing appointments:", error);
      return [];
    }
  };

  const onSubmit: SubmitHandler<z.infer<typeof AppointmentSchema>> = async (
    values
  ) => {
    try {
      setIsSubmitting(true);
      const newData = { ...values, patient_id: data?.id! };

      const res = await createNewAppointment(newData);

      if (res.success) {
        form.reset({});
        router.refresh();
        toast.success("Appointment request submitted successfully! You will receive a confirmation email once the doctor reviews your request.");
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        toast.error(res.msg || "Failed to book appointment");
        
        // If booking failed, get smart suggestions
        if (selectedDoctor && values.appointment_date && values.time) {
          await getSmartSuggestions(selectedDoctor.id, values.appointment_date, values.time);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSmartSuggestions = async (doctorId: string, date: string, time: string) => {
    try {
      setScheduleLoading(true);
      const response = await fetch(`/api/scheduling/suggestions?doctorId=${doctorId}&date=${date}&time=${time}&days=7`);
      
      if (response.ok) {
        const result = await response.json();
        setSuggestions(result.data || []);
        setShowSuggestions(true);
        setValidationMessage(`Found ${result.data?.length || 0} alternative time slots`);
        setValidationType("warning");
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
    } finally {
      setScheduleLoading(false);
    }
  };

  const applySuggestion = (suggestion: {date: string; time: string}) => {
    form.setValue('appointment_date', suggestion.date);
    form.setValue('time', suggestion.time);
    setShowSuggestions(false);
    setSuggestions([]);
    setValidationMessage("Alternative time selected");
    setValidationType("success");
  };

  const getValidationIcon = () => {
    switch (validationType) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center gap-2 justify-start text-sm font-light bg-blue-600 text-white"
        >
          <UserPen size={16} /> Book Appointment
        </Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl rounded-r-2xl md:h-p[95%] md:top-[2.5%] md:right-[1%] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span>Loading</span>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <SheetHeader>
              <SheetTitle>Book Appointment</SheetTitle>
            </SheetHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-5"
              >
                {/* Patient Info */}
                <div className="w-full rounded-md border border-input bg-background px-3 py-1 flex items-center gap-4">
                  <ProfileImage
                    url={data?.img!}
                    name={patientName}
                    className="size-16 border border-input"
                    bgColor={data?.colorCode!}
                  />
                  <div>
                    <p className="font-semibold text-lg">{patientName}</p>
                    <span className="text-sm text-gray-500 capitalize">
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
                  placeholder="Select a appointment type"
                />

                {/* Doctor Selection */}
                <FormField
                  control={form.control}
                  name="doctor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <UserPen className="h-4 w-4" />
                        Select Doctor First
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a doctor to see their available times" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="">
                          {doctors?.map((i, id) => (
                            <SelectItem key={id} value={i.id} className="p-2">
                              <div className="flex flex-row gap-2 p-2">
                                <ProfileImage
                                  url={i?.img!}
                                  name={i?.name}
                                  bgColor={i?.colorCode!}
                                  textClassName="text-black"
                                />
                                <div>
                                  <p className="font-medium text-start ">
                                    {i.name}
                                  </p>
                                  <span className="text-sm text-gray-600">
                                    {i?.specialization}
                                  </span>
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

                {/* Doctor Schedule Info */}
                {selectedDoctor && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Dr. {selectedDoctor.name} - Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {scheduleLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ) : doctorSchedule ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getValidationIcon()}
                            <span className="text-sm text-gray-600">{validationMessage}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Appointment Duration:</span>
                              <span className="ml-1">{doctorSchedule.workingHours[0]?.appointmentDuration || 30} min</span>
                            </div>
                            <div>
                              <span className="font-medium">Buffer Time:</span>
                              <span className="ml-1">{doctorSchedule.workingHours[0]?.bufferTime || 5} min</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          No schedule information available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Date and Time Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Step 2: Select Date
                    </label>
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="appointment_date"
                      placeholder=""
                      label=""
                      inputType="date"
                    />
                    {!selectedDoctor && (
                      <p className="text-xs text-gray-500">
                        Please select a doctor first to see available time slots
                      </p>
                    )}
                  </div>
                  
                  {/* Dynamic Time Slots */}
                  {watchedDate && availableTimeSlots.length > 0 && (
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Available Time Slots
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting || scheduleLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a time slot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {availableTimeSlots.map((slot, index) => (
                                <SelectItem 
                                  key={index} 
                                  value={slot.time}
                                  disabled={!slot.available}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{slot.time}</span>
                                    {!slot.available && slot.reason && (
                                      <Badge variant="secondary" className="text-xs">
                                        {slot.reason}
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

                {/* Validation Message */}
                {validationMessage && (
                  <Alert className={validationType === "error" ? "border-red-200 bg-red-50" : 
                                   validationType === "warning" ? "border-yellow-200 bg-yellow-50" : 
                                   "border-green-200 bg-green-50"}>
                    <AlertDescription className="flex items-center gap-2">
                      {getValidationIcon()}
                      {validationMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Smart Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Alternative Time Slots
                      </CardTitle>
                      <CardDescription>
                        The selected time isn't available. Here are some alternatives:
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {suggestions.slice(0, 8).map((suggestion, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium">
                                {new Date(suggestion.date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                              <div className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {suggestion.time}
                              </div>
                              <Badge 
                                variant={suggestion.priority === 'high' ? 'default' : 
                                        suggestion.priority === 'medium' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              {suggestion.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Click any suggestion to apply it to your booking
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  disabled={isSubmitting || scheduleLoading}
                  type="submit"
                  className="bg-blue-600 w-full"
                >
                  {isSubmitting ? "Booking..." : "Book Appointment"}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
