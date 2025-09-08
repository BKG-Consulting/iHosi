"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Coffee, 
  Plane, 
  Shield,
  Settings,
  MessageSquare
} from 'lucide-react';

interface AvailabilityToggleProps {
  doctorId: string;
  currentStatus?: string;
  onStatusChange?: (status: string) => void;
}

const availabilityOptions = [
  {
    value: 'AVAILABLE',
    label: 'Available',
    description: 'Accepting new appointments',
    icon: CheckCircle,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    value: 'UNAVAILABLE',
    label: 'Unavailable',
    description: 'Not accepting new appointments',
    icon: XCircle,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    value: 'BUSY',
    label: 'Busy',
    description: 'Currently with patients',
    icon: Clock,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    value: 'ON_BREAK',
    label: 'On Break',
    description: 'Taking a break',
    icon: Coffee,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    value: 'ON_LEAVE',
    label: 'On Leave',
    description: 'Not available for appointments',
    icon: Plane,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    value: 'EMERGENCY_ONLY',
    label: 'Emergency Only',
    description: 'Only emergency appointments',
    icon: Shield,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

export function AvailabilityToggle({ doctorId, currentStatus = 'AVAILABLE', onStatusChange }: AvailabilityToggleProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const currentOption = availabilityOptions.find(opt => opt.value === status) || availabilityOptions[0];

  useEffect(() => {
    setStatus(currentStatus);
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = async (newStatus: string, changeReason?: string) => {
    if (newStatus === status) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/doctors/${doctorId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availability_status: newStatus,
          reason: changeReason || `Status changed to ${newStatus}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
        toast.success('Availability status updated successfully');
        setIsDialogOpen(false);
        setReason('');
      } else {
        toast.error(result.message || 'Failed to update availability status');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickToggle = () => {
    const newStatus = status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    handleStatusChange(newStatus);
  };

  const handleDetailedChange = () => {
    handleStatusChange(selectedStatus, reason);
  };

  const IconComponent = currentOption.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Availability Status
            </CardTitle>
            <CardDescription>
              Manage your availability for patient appointments
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`${currentOption.bgColor} ${currentOption.borderColor} ${currentOption.textColor} border`}
          >
            <IconComponent className="w-3 h-3 mr-1" />
            {currentOption.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className={`p-4 rounded-lg ${currentOption.bgColor} ${currentOption.borderColor} border`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${currentOption.color} text-white`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-semibold ${currentOption.textColor}`}>
                {currentOption.label}
              </h3>
              <p className={`text-sm ${currentOption.textColor} opacity-80`}>
                {currentOption.description}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Switch
              checked={status === 'AVAILABLE'}
              onCheckedChange={handleQuickToggle}
              disabled={isLoading}
            />
            <div>
              <Label className="text-sm font-medium">
                {status === 'AVAILABLE' ? 'Available for appointments' : 'Not available for appointments'}
              </Label>
              <p className="text-xs text-gray-500">
                Quick toggle between available and unavailable
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Status Change */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Change Status with Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Availability Status</DialogTitle>
              <DialogDescription>
                Select your new availability status and provide additional details.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => {
                      const OptionIcon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <OptionIcon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide additional details about your availability change..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDetailedChange}
                disabled={isLoading || selectedStatus === status}
              >
                {isLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status History */}
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}


