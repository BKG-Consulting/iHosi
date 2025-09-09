import React, { Fragment, useState, useEffect } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Card, CardContent } from "./ui/card";

interface InputProps {
  type: "input" | "select" | "checkbox" | "switch" | "radio" | "textarea";
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  inputType?: "text" | "email" | "password" | "date";
  selectList?: { label: string; value: string }[];
  defaultValue?: string;
  disabled?: boolean;
}

const RenderInput = ({ field, props }: { field: any; props: InputProps }) => {
  switch (props.type) {
    case "input":
      return (
        <FormControl>
          <Input
            type={props.inputType}
            placeholder={props.placeholder}
            {...field}
          />
        </FormControl>
      );

    case "select":
      return (
        <Select onValueChange={field.onChange} value={field?.value} disabled={props.disabled}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {props.selectList?.map((i, id) => (
              <SelectItem key={id} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "checkbox":
      return (
        <div className="items-top flex space-x-2">
          <Checkbox
            id={props.name}
            checked={field.value || false}
            onCheckedChange={(checked) => field.onChange(checked === true)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={props.name}
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {props.label}
            </label>
            <p className="text-sm text-muted-foreground">{props.placeholder}</p>
          </div>
        </div>
      );

    case "radio":
      return (
        <div className="w-full">
          <FormLabel>{props.label}</FormLabel>
          <RadioGroup
            defaultValue={props.defaultValue}
            onChange={field.onChange}
            className="flex gap-4"
          >
            {props?.selectList?.map((i, id) => (
              <div className="flex items-center w-full" key={id}>
                <RadioGroupItem
                  value={i.value}
                  id={i.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={i.value}
                  className="flex flex-1 items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-600"
                >
                  {i.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case "textarea":
      return (
        <FormControl>
          <Textarea
            type={props.inputType}
            placeholder={props.placeholder}
            {...field}
          ></Textarea>
        </FormControl>
      );
  }
};
export const CustomInput = (props: InputProps) => {
  const { name, label, control, type } = props;

  return (
    // <div className="w-full pt-6">
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {type !== "radio" && type !== "checkbox" && (
            <FormLabel>{label}</FormLabel>
          )}
          <RenderInput field={field} props={props} />
          <FormMessage />
        </FormItem>
      )}
    />
    // </div>
  );
};

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

interface SwitchProps {
  data: { label: string; value: string }[];
  setWorkSchedule: React.Dispatch<React.SetStateAction<Day[]>>;
}

export const SwitchInput = ({ data, setWorkSchedule }: SwitchProps) => {
  const [localWorkSchedule, setLocalWorkSchedule] = useState<Day[]>([]);

  const handleChange = (day: string, field: any, value: any) => {
    setLocalWorkSchedule((prevDays: Day[]) => {
      const dayExist = prevDays.find((d: Day) => d.day === day);

      if (dayExist) {
        return prevDays.map((d: Day) =>
          d.day === day ? { ...d, [field]: value } : d
        );
      } else {
        if (field === true) {
          return [
            ...prevDays,
            { 
              day, 
              start_time: "09:00", 
              close_time: "17:00",
              is_working: true,
              break_start: "12:00",
              break_end: "13:00",
              max_appointments: 20,
              appointment_duration: 30
            },
          ];
        } else {
          return [...prevDays, { day, [field]: value }];
        }
      }
    });
  };

  const handleWorkingDayToggle = (day: string, isWorking: boolean) => {
    setLocalWorkSchedule((prevDays: Day[]) => {
      const dayExist = prevDays.find((d: Day) => d.day === day);

      if (dayExist) {
        return prevDays.map((d: Day) =>
          d.day === day ? { ...d, is_working: isWorking } : d
        );
      } else {
        return [
          ...prevDays,
          { 
            day, 
            start_time: "09:00", 
              close_time: "17:00",
            is_working: isWorking,
            break_start: "12:00",
            break_end: "13:00",
            max_appointments: 20,
            appointment_duration: 30
          },
        ];
      }
    });
  };

  // Sync with parent component
  useEffect(() => {
    setWorkSchedule(localWorkSchedule);
  }, [localWorkSchedule, setWorkSchedule]);

  return (
    <div className="space-y-4">
      {data?.map((el, id) => {
        const dayData = localWorkSchedule.find((d: Day) => d.day === el.value);
        const isWorking = dayData?.is_working ?? false;
        
        return (
          <Card key={id} className="border-gray-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id={el.value}
                    className="data-[state=checked]:bg-blue-600 peer"
                    checked={isWorking}
                    onCheckedChange={(checked) => handleWorkingDayToggle(el.value, checked)}
                  />
                  <Label htmlFor={el.value} className="w-20 capitalize font-medium">
                    {el.label}
                  </Label>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isWorking 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {isWorking ? "Working" : "Not Working"}
                </span>
              </div>

              {!isWorking && (
                <div className="text-center py-4 text-gray-500 italic">
                  Not working on this day
                </div>
              )}

              {isWorking && (
                <div className="space-y-4">
                  {/* Working Hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Start Time</Label>
                      <Input
                        name={`${el.value}.start_time`}
                        type="time"
                        value={dayData?.start_time || "09:00"}
                        onChange={(e) =>
                          handleChange(el.value, "start_time", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">End Time</Label>
                      <Input
                        name={`${el.value}.close_time`}
                        type="time"
                        value={dayData?.close_time || "17:00"}
                        onChange={(e) =>
                          handleChange(el.value, "close_time", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Break Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Break Start</Label>
                      <Input
                        name={`${el.value}.break_start`}
                        type="time"
                        value={dayData?.break_start || "12:00"}
                        onChange={(e) =>
                          handleChange(el.value, "break_start", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Break End</Label>
                      <Input
                        name={`${el.value}.break_end`}
                        type="time"
                        value={dayData?.break_end || "13:00"}
                        onChange={(e) =>
                          handleChange(el.value, "break_end", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Capacity Management */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Max Appointments</Label>
                      <Input
                        name={`${el.value}.max_appointments`}
                        type="number"
                        min="1"
                        max="100"
                        value={dayData?.max_appointments || 20}
                        onChange={(e) =>
                          handleChange(el.value, "max_appointments", parseInt(e.target.value))
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Appointment Duration (min)</Label>
                      <Input
                        name={`${el.value}.appointment_duration`}
                        type="number"
                        min="15"
                        max="120"
                        step="15"
                        value={dayData?.appointment_duration || 30}
                        onChange={(e) =>
                          handleChange(el.value, "appointment_duration", parseInt(e.target.value))
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
