'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Mail, FileText, Table, Calendar as CalendarIconLucide, Database, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ScheduleExportProps {
  doctorId: string;
  doctorName: string;
}

interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'ical' | 'json';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  includeAppointments: boolean;
  includeWorkingHours: boolean;
  includeLeaveRequests: boolean;
  includeTemplates: boolean;
  emailDelivery: boolean;
  emailAddress: string;
}

const formatOptions = [
  { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Printable schedule report' },
  { value: 'csv', label: 'CSV Spreadsheet', icon: Table, description: 'Data analysis and backup' },
  { value: 'excel', label: 'Excel Workbook', icon: Table, description: 'Advanced spreadsheet format' },
  { value: 'ical', label: 'iCal Calendar', icon: CalendarIconLucide, description: 'Import to calendar apps' },
  { value: 'json', label: 'JSON Data', icon: Database, description: 'API integration and backup' },
];

export function ScheduleExport({ doctorId, doctorName }: ScheduleExportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    includeAppointments: true,
    includeWorkingHours: true,
    includeLeaveRequests: false,
    includeTemplates: false,
    emailDelivery: false,
    emailAddress: '',
  });

  const handleExport = async (scheduleForLater: boolean = false) => {
    setIsLoading(true);
    if (scheduleForLater) {
      setIsScheduling(true);
    }

    try {
      const params = new URLSearchParams({
        format: exportOptions.format,
        startDate: exportOptions.dateRange.startDate.toISOString(),
        endDate: exportOptions.dateRange.endDate.toISOString(),
        includeAppointments: exportOptions.includeAppointments.toString(),
        includeWorkingHours: exportOptions.includeWorkingHours.toString(),
        includeLeaveRequests: exportOptions.includeLeaveRequests.toString(),
        includeTemplates: exportOptions.includeTemplates.toString(),
        emailDelivery: exportOptions.emailDelivery.toString(),
        ...(exportOptions.emailDelivery && exportOptions.emailAddress && { 
          emailAddress: exportOptions.emailAddress 
        }),
      });

      const url = `/api/doctors/${doctorId}/schedule/export?${params.toString()}`;
      
      if (scheduleForLater) {
        // POST request for scheduled export
        const response = await fetch(`/api/doctors/${doctorId}/schedule/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            format: exportOptions.format,
            dateRange: {
              startDate: exportOptions.dateRange.startDate.toISOString(),
              endDate: exportOptions.dateRange.endDate.toISOString(),
            },
            includeAppointments: exportOptions.includeAppointments,
            includeWorkingHours: exportOptions.includeWorkingHours,
            includeLeaveRequests: exportOptions.includeLeaveRequests,
            includeTemplates: exportOptions.includeTemplates,
            emailDelivery: exportOptions.emailDelivery,
            emailAddress: exportOptions.emailAddress,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Failed to schedule export');
        }

        toast.success('Export scheduled successfully! You will receive an email when ready.');
      } else {
        // GET request for immediate export
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Export failed');
        }

        // Handle different response types
        if (exportOptions.format === 'json') {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { 
            type: 'application/json' 
          });
          downloadFile(blob, `schedule_${doctorName}_${format(new Date(), 'yyyy-MM-dd')}.json`);
        } else {
          const blob = await response.blob();
          const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
                          `schedule_${doctorName}_${format(new Date(), 'yyyy-MM-dd')}.${exportOptions.format}`;
          downloadFile(blob, filename);
        }

        toast.success('Schedule exported successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsLoading(false);
      setIsScheduling(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const updateExportOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const selectedFormat = formatOptions.find(f => f.value === exportOptions.format);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Download className="w-5 h-5 text-blue-600" />
          Export Schedule
        </CardTitle>
        <CardDescription>
          Export your schedule in various formats for different use cases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Export Format</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {formatOptions.map((format) => {
              const Icon = format.icon;
              return (
                <div
                  key={format.value}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                    exportOptions.format === format.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => updateExportOption('format', format.value)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{format.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{format.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Start Date</Label>
              <Popover open={showDatePicker === 'start'} onOpenChange={(open) => setShowDatePicker(open ? 'start' : null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !exportOptions.dateRange.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {exportOptions.dateRange.startDate ? (
                      format(exportOptions.dateRange.startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={exportOptions.dateRange.startDate}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        updateExportOption('dateRange', {
                          ...exportOptions.dateRange,
                          startDate: date,
                        });
                        setShowDatePicker(null);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">End Date</Label>
              <Popover open={showDatePicker === 'end'} onOpenChange={(open) => setShowDatePicker(open ? 'end' : null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !exportOptions.dateRange.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {exportOptions.dateRange.endDate ? (
                      format(exportOptions.dateRange.endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={exportOptions.dateRange.endDate}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        updateExportOption('dateRange', {
                          ...exportOptions.dateRange,
                          endDate: date,
                        });
                        setShowDatePicker(null);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Content Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Include in Export</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="appointments"
                checked={exportOptions.includeAppointments}
                onCheckedChange={(checked) => updateExportOption('includeAppointments', checked)}
              />
              <Label htmlFor="appointments" className="text-sm">Appointments</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="workingHours"
                checked={exportOptions.includeWorkingHours}
                onCheckedChange={(checked) => updateExportOption('includeWorkingHours', checked)}
              />
              <Label htmlFor="workingHours" className="text-sm">Working Hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="leaveRequests"
                checked={exportOptions.includeLeaveRequests}
                onCheckedChange={(checked) => updateExportOption('includeLeaveRequests', checked)}
              />
              <Label htmlFor="leaveRequests" className="text-sm">Leave Requests</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="templates"
                checked={exportOptions.includeTemplates}
                onCheckedChange={(checked) => updateExportOption('includeTemplates', checked)}
              />
              <Label htmlFor="templates" className="text-sm">Schedule Templates</Label>
            </div>
          </div>
        </div>

        {/* Email Delivery */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailDelivery"
              checked={exportOptions.emailDelivery}
              onCheckedChange={(checked) => updateExportOption('emailDelivery', checked)}
            />
            <Label htmlFor="emailDelivery" className="text-sm font-medium">Email Delivery</Label>
          </div>
          {exportOptions.emailDelivery && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Email Address</Label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={exportOptions.emailAddress}
                onChange={(e) => updateExportOption('emailAddress', e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Export Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => handleExport(false)}
            disabled={isLoading || isScheduling}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Now
              </>
            )}
          </Button>
          <Button
            onClick={() => handleExport(true)}
            disabled={isLoading || isScheduling}
            variant="outline"
            className="flex-1"
          >
            {isScheduling ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Schedule Export
              </>
            )}
          </Button>
        </div>

        {/* Format Info */}
        {selectedFormat && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <selectedFormat.icon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">{selectedFormat.label}</span>
            </div>
            <p className="text-xs text-gray-600">{selectedFormat.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
