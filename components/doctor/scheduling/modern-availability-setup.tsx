'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Calendar, Clock, Sparkles, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeBlock {
  hour: number;
  isAvailable: boolean;
}

interface DaySchedule {
  day: string;
  blocks: TimeBlock[];
  isWorking: boolean;
}

interface ModernAvailabilitySetupProps {
  doctorId: string;
  onSave?: (schedule: any) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

const PRESETS = [
  {
    name: '9-5 Mon-Fri',
    schedule: {
      startHour: 9,
      endHour: 17,
      lunchStart: 12,
      lunchEnd: 13,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  },
  {
    name: '8-6 Mon-Fri',
    schedule: {
      startHour: 8,
      endHour: 18,
      lunchStart: 12,
      lunchEnd: 13,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  },
  {
    name: 'Half Day',
    schedule: {
      startHour: 9,
      endHour: 13,
      lunchStart: null,
      lunchEnd: null,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  },
  {
    name: 'Weekend',
    schedule: {
      startHour: 10,
      endHour: 16,
      lunchStart: 12,
      lunchEnd: 13,
      workingDays: ['Saturday', 'Sunday']
    }
  }
];

export function ModernAvailabilitySetup({ doctorId, onSave }: ModernAvailabilitySetupProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [paintMode, setPaintMode] = useState<'available' | 'unavailable'>('available');
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(5);
  const [maxAppointments, setMaxAppointments] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    initializeSchedule();
  }, []);

  const initializeSchedule = () => {
    const initialSchedule = DAYS.map(day => ({
      day,
      isWorking: !['Saturday', 'Sunday'].includes(day),
      blocks: HOURS.map(hour => ({
        hour,
        isAvailable: hour >= 9 && hour < 17 && hour !== 12 && !['Saturday', 'Sunday'].includes(day)
      }))
    }));
    setSchedule(initialSchedule);
    setIsLoading(false);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const newSchedule = DAYS.map(day => ({
      day,
      isWorking: preset.schedule.workingDays.includes(day),
      blocks: HOURS.map(hour => {
        const isWorkingDay = preset.schedule.workingDays.includes(day);
        const isWorkingHour = hour >= preset.schedule.startHour && hour < preset.schedule.endHour;
        const isLunch = preset.schedule.lunchStart && preset.schedule.lunchEnd &&
                       hour >= preset.schedule.lunchStart && hour < preset.schedule.lunchEnd;
        
        return {
          hour,
          isAvailable: isWorkingDay && isWorkingHour && !isLunch
        };
      })
    }));
    setSchedule(newSchedule);
    setSuccessMessage(`Applied "${preset.name}" preset`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const toggleBlock = (dayIndex: number, hourIndex: number) => {
    setSchedule(prev => {
      const newSchedule = [...prev];
      newSchedule[dayIndex].blocks[hourIndex].isAvailable = 
        !newSchedule[dayIndex].blocks[hourIndex].isAvailable;
      return newSchedule;
    });
  };

  const handleMouseDown = (dayIndex: number, hourIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    const currentBlock = schedule[dayIndex].blocks[hourIndex];
    setPaintMode(currentBlock.isAvailable ? 'unavailable' : 'available');
    setIsPainting(true);
    toggleBlock(dayIndex, hourIndex);
  };

  const handleMouseEnter = (dayIndex: number, hourIndex: number) => {
    if (isPainting) {
      setSchedule(prev => {
        const newSchedule = [...prev];
        newSchedule[dayIndex].blocks[hourIndex].isAvailable = paintMode === 'available';
        return newSchedule;
      });
    }
  };

  const handleMouseUp = () => {
    setIsPainting(false);
  };

  const copyDaySchedule = (sourceDayIndex: number) => {
    const sourceBlocks = schedule[sourceDayIndex].blocks;
    setSchedule(prev => prev.map((day, index) => {
      if (index === sourceDayIndex) return day;
      return {
        ...day,
        blocks: sourceBlocks.map(block => ({ ...block })),
        isWorking: schedule[sourceDayIndex].isWorking
      };
    }));
    setSuccessMessage(`Copied ${schedule[sourceDayIndex].day} to all days`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const clearDay = (dayIndex: number) => {
    setSchedule(prev => {
      const newSchedule = [...prev];
      newSchedule[dayIndex].blocks = newSchedule[dayIndex].blocks.map(block => ({
        ...block,
        isAvailable: false
      }));
      newSchedule[dayIndex].isWorking = false;
      return newSchedule;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert visual schedule to API format
      const workingHours = schedule.map(day => {
        const availableBlocks = day.blocks.filter(b => b.isAvailable);
        
        if (availableBlocks.length === 0) {
          return {
            day: day.day,
            isWorking: false,
            startTime: '09:00',
            endTime: '17:00',
            breakStart: undefined,
            breakEnd: undefined,
            maxAppointments,
            appointmentDuration,
            bufferTime,
            timezone: 'UTC'
          };
        }

        const startHour = Math.min(...availableBlocks.map(b => b.hour));
        const endHour = Math.max(...availableBlocks.map(b => b.hour)) + 1;
        
        // Detect break time (gap in availability)
        let breakStart, breakEnd;
        for (let i = 0; i < day.blocks.length - 1; i++) {
          const current = day.blocks[i];
          const next = day.blocks[i + 1];
          if (!current.isAvailable && next.isAvailable && current.hour >= startHour && current.hour < endHour) {
            if (!breakStart) {
              breakStart = current.hour;
            }
          } else if (current.isAvailable && !next.isAvailable && next.hour > startHour && next.hour < endHour) {
            if (breakStart && !breakEnd) {
              breakEnd = next.hour + 1;
            }
          }
        }

        return {
          day: day.day,
          isWorking: true,
          startTime: `${startHour.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
          breakStart: breakStart ? `${breakStart.toString().padStart(2, '0')}:00` : undefined,
          breakEnd: breakEnd ? `${breakEnd.toString().padStart(2, '0')}:00` : undefined,
          maxAppointments,
          appointmentDuration,
          bufferTime,
          timezone: 'UTC'
        };
      });

      const response = await fetch(`/api/doctors/${doctorId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workingHours,
          aiOptimization: false,
          recurrenceType: 'WEEKLY',
          isTemplate: false
        })
      });

      if (!response.ok) throw new Error('Failed to save schedule');

      setSuccessMessage('Schedule saved successfully! ✓');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      if (onSave) {
        onSave({ workingHours });
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getBlockStats = (daySchedule: DaySchedule) => {
    const available = daySchedule.blocks.filter(b => b.isAvailable).length;
    return {
      available,
      total: HOURS.length,
      percentage: Math.round((available / HOURS.length) * 100)
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading schedule...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calendar className="h-6 w-6 text-blue-600" />
                Visual Availability Setup
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Click and drag to paint your weekly availability
              </CardDescription>
            </div>
            <Sparkles className="h-12 w-12 text-blue-400 opacity-50" />
          </div>
        </CardHeader>
      </Card>

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Quick Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESETS.map(preset => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => applyPreset(preset)}
                className="h-auto py-4 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{preset.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Time Block Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Schedule Grid</CardTitle>
          <CardDescription>
            🎨 Click & drag to paint  •  🖱️ Individual click to toggle  •  Darker = Available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="text-xs font-medium text-gray-500 flex items-end pb-2">Time</div>
                {DAYS.map(day => (
                  <div key={day} className="text-center">
                    <div className="font-semibold text-sm mb-1">{day.slice(0, 3)}</div>
                    <Badge variant="outline" className="text-xs">
                      {getBlockStats(schedule[DAYS.indexOf(day)]).available}h
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Time Blocks */}
              {HOURS.map((hour, hourIndex) => (
                <div key={hour} className="grid grid-cols-8 gap-2 mb-1">
                  <div className="text-xs font-medium text-gray-600 flex items-center">
                    {formatHour(hour)}
                  </div>
                  {DAYS.map((day, dayIndex) => {
                    const block = schedule[dayIndex].blocks[hourIndex];
                    return (
                      <div
                        key={`${day}-${hour}`}
                        onMouseDown={(e) => handleMouseDown(dayIndex, hourIndex, e)}
                        onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex)}
                        className={cn(
                          "h-8 rounded cursor-pointer transition-all border-2 select-none",
                          block.isAvailable
                            ? "bg-blue-500 border-blue-600 hover:bg-blue-600"
                            : "bg-gray-100 border-gray-200 hover:bg-gray-200"
                        )}
                        title={`${day} ${formatHour(hour)}: ${block.isAvailable ? 'Available' : 'Unavailable'}`}
                      />
                    );
                  })}
                </div>
              ))}

              {/* Day Actions */}
              <div className="grid grid-cols-8 gap-2 mt-4">
                <div className="text-xs font-medium text-gray-500">Actions</div>
                {DAYS.map((day, dayIndex) => (
                  <div key={day} className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyDaySchedule(dayIndex)}
                      className="h-7 px-2 flex-1"
                      title={`Copy ${day} to all days`}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearDay(dayIndex)}
                      className="h-7 px-2"
                      title={`Clear ${day}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appointment Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Appointment Duration</Label>
              <Select
                value={appointmentDuration.toString()}
                onValueChange={(v) => setAppointmentDuration(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buffer Time Between</Label>
              <Select
                value={bufferTime.toString()}
                onValueChange={(v) => setBufferTime(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Appointments per Slot</Label>
              <Select
                value={maxAppointments.toString()}
                onValueChange={(v) => setMaxAppointments(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Exclusive)</SelectItem>
                  <SelectItem value="2">2 patients</SelectItem>
                  <SelectItem value="3">3 patients</SelectItem>
                  <SelectItem value="4">4 patients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {schedule.filter(d => d.blocks.some(b => b.isAvailable)).length} working days configured
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Schedule
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


