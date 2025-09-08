'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Timer,
  Users,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
  maxBookings: number;
  currentBookings: number;
  type: 'REGULAR' | 'EMERGENCY' | 'FOLLOW_UP' | 'CONSULTATION';
  price?: number;
  notes?: string;
}

interface TimeSlotManagerProps {
  doctorId: string;
  selectedDate: Date;
  workingHours: {
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  };
  appointmentDuration: number;
  bufferTime: number;
  onTimeSlotsUpdate?: (timeSlots: TimeSlot[]) => void;
}

export const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({
  doctorId,
  selectedDate,
  workingHours,
  appointmentDuration,
  bufferTime,
  onTimeSlotsUpdate
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    startTime: '',
    endTime: '',
    duration: appointmentDuration,
    isAvailable: true,
    maxBookings: 1,
    type: 'REGULAR'
  });

  // Generate time slots based on working hours
  const generateTimeSlots = () => {
    setIsGenerating(true);
    
    try {
      const slots: TimeSlot[] = [];
      const start = new Date(`2000-01-01T${workingHours.startTime}`);
      const end = new Date(`2000-01-01T${workingHours.endTime}`);
      const breakStart = workingHours.breakStart ? new Date(`2000-01-01T${workingHours.breakStart}`) : null;
      const breakEnd = workingHours.breakEnd ? new Date(`2000-01-01T${workingHours.breakEnd}`) : null;
      
      let current = new Date(start);
      
      while (current < end) {
        const slotEnd = new Date(current.getTime() + appointmentDuration * 60000);
        
        // Skip if slot falls within break time
        if (breakStart && breakEnd && current >= breakStart && current < breakEnd) {
          current = new Date(breakEnd);
          continue;
        }
        
        // Skip if slot would extend beyond working hours
        if (slotEnd > end) {
          break;
        }
        
        const slot: TimeSlot = {
          id: `slot-${current.getHours()}-${current.getMinutes()}`,
          startTime: current.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5),
          duration: appointmentDuration,
          isAvailable: true,
          maxBookings: 1,
          currentBookings: 0,
          type: 'REGULAR'
        };
        
        slots.push(slot);
        current = new Date(current.getTime() + (appointmentDuration + bufferTime) * 60000);
      }
      
      setTimeSlots(slots);
      onTimeSlotsUpdate?.(slots);
      toast.success(`Generated ${slots.length} time slots`);
    } catch (error) {
      toast.error('Failed to generate time slots');
      console.error('Error generating time slots:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addCustomSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      toast.error('Please provide start and end times');
      return;
    }
    
    const slot: TimeSlot = {
      id: `custom-${Date.now()}`,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      duration: newSlot.duration || appointmentDuration,
      isAvailable: newSlot.isAvailable ?? true,
      maxBookings: newSlot.maxBookings || 1,
      currentBookings: 0,
      type: newSlot.type || 'REGULAR',
      price: newSlot.price,
      notes: newSlot.notes
    };
    
    setTimeSlots(prev => [...prev, slot].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setNewSlot({
      startTime: '',
      endTime: '',
      duration: appointmentDuration,
      isAvailable: true,
      maxBookings: 1,
      type: 'REGULAR'
    });
    toast.success('Custom time slot added');
  };

  const updateSlot = (slotId: string, updates: Partial<TimeSlot>) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, ...updates } : slot
    ));
    setEditingSlot(null);
    toast.success('Time slot updated');
  };

  const deleteSlot = (slotId: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
    toast.success('Time slot deleted');
  };

  const toggleSlotAvailability = (slotId: string) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
    ));
  };

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'REGULAR': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EMERGENCY': return 'bg-red-100 text-red-800 border-red-200';
      case 'FOLLOW_UP': return 'bg-green-100 text-green-800 border-green-200';
      case 'CONSULTATION': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSlotStatusIcon = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      return <X className="w-4 h-4 text-red-500" />;
    }
    if (slot.currentBookings >= slot.maxBookings) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#046658]">Time Slot Management</h3>
          <p className="text-[#3E4C4B]">
            Manage time slots for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={generateTimeSlots}
            disabled={isGenerating}
            variant="outline"
            className="border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Auto Generate'}
          </Button>
        </div>
      </div>

      {/* Add Custom Slot */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
          <CardTitle className="text-lg font-bold">Add Custom Time Slot</CardTitle>
          <CardDescription className="text-white/90">
            Create a custom time slot outside of regular working hours
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-[#3E4C4B]">Start Time</Label>
              <Input
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#3E4C4B]">End Time</Label>
              <Input
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#3E4C4B]">Type</Label>
              <Select value={newSlot.type} onValueChange={(value) => setNewSlot(prev => ({ ...prev, type: value as any }))}>
                <SelectTrigger className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                  <SelectItem value="CONSULTATION">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-[#3E4C4B]">Max Bookings</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newSlot.maxBookings}
                onChange={(e) => setNewSlot(prev => ({ ...prev, maxBookings: parseInt(e.target.value) }))}
                className="mt-1 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={newSlot.isAvailable}
                onCheckedChange={(checked) => setNewSlot(prev => ({ ...prev, isAvailable: checked }))}
              />
              <Label className="text-sm font-medium text-[#3E4C4B]">Available for booking</Label>
            </div>
            <Button 
              onClick={addCustomSlot}
              className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Slot
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Grid */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Time Slots</CardTitle>
              <CardDescription className="text-white/90">
                {timeSlots.length} slots configured
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Available</span>
              <AlertTriangle className="w-4 h-4 ml-4" />
              <span className="text-sm">Full</span>
              <X className="w-4 h-4 ml-4" />
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {timeSlots.length === 0 ? (
            <div className="text-center py-12 text-[#3E4C4B]">
              <Clock className="w-16 h-16 mx-auto mb-4 text-[#2EB6B0]" />
              <h3 className="text-lg font-semibold text-[#046658] mb-2">No Time Slots</h3>
              <p className="text-sm">Generate time slots or add custom ones to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
                    slot.isAvailable 
                      ? "bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] border-[#2EB6B0]" 
                      : "bg-gray-100 border-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getSlotStatusIcon(slot)}
                      <span className="font-semibold text-[#046658]">
                        {formatTime(slot.startTime)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingSlot(editingSlot === slot.id ? null : slot.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSlot(slot.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#3E4C4B]">Duration:</span>
                      <span className="font-medium">{slot.duration} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#3E4C4B]">Bookings:</span>
                      <span className="font-medium">
                        {slot.currentBookings}/{slot.maxBookings}
                      </span>
                    </div>
                    <Badge className={getSlotTypeColor(slot.type)}>
                      {slot.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  {editingSlot === slot.id && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-[#D1F1F2]">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium text-[#3E4C4B]">Max Bookings</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={slot.maxBookings}
                            onChange={(e) => updateSlot(slot.id, { maxBookings: parseInt(e.target.value) })}
                            className="mt-1 h-8 text-sm border border-[#D1F1F2] rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-[#3E4C4B]">Type</Label>
                          <Select value={slot.type} onValueChange={(value) => updateSlot(slot.id, { type: value as any })}>
                            <SelectTrigger className="mt-1 h-8 text-sm border border-[#D1F1F2] rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="REGULAR">Regular</SelectItem>
                              <SelectItem value="EMERGENCY">Emergency</SelectItem>
                              <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                              <SelectItem value="CONSULTATION">Consultation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={slot.isAvailable}
                            onCheckedChange={() => toggleSlotAvailability(slot.id)}
                          />
                          <Label className="text-xs font-medium text-[#3E4C4B]">Available</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

