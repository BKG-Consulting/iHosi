/**
 * Schedule Frequency Controls Component
 * 
 * Provides comprehensive frequency and recurrence controls for doctor schedules
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Repeat, Settings } from 'lucide-react';

interface FrequencyControlsProps {
  recurrenceType: string;
  onRecurrenceChange: (type: string) => void;
  effectiveFrom?: Date;
  onEffectiveFromChange: (date: Date | undefined) => void;
  effectiveUntil?: Date;
  onEffectiveUntilChange: (date: Date | undefined) => void;
  customPattern?: string;
  onCustomPatternChange: (pattern: string) => void;
  isTemplate: boolean;
  onTemplateChange: (isTemplate: boolean) => void;
}

export const ScheduleFrequencyControls: React.FC<FrequencyControlsProps> = ({
  recurrenceType,
  onRecurrenceChange,
  effectiveFrom,
  onEffectiveFromChange,
  effectiveUntil,
  onEffectiveUntilChange,
  customPattern,
  onCustomPatternChange,
  isTemplate,
  onTemplateChange
}) => {
  const recurrenceOptions = [
    { value: 'WEEKLY', label: 'Weekly', description: 'Every week' },
    { value: 'DAILY', label: 'Daily', description: 'Every day' },
    { value: 'BIWEEKLY', label: 'Bi-weekly', description: 'Every other week' },
    { value: 'MONTHLY', label: 'Monthly', description: 'Every month' },
    { value: 'CUSTOM', label: 'Custom', description: 'Custom pattern' }
  ];

  const customPatterns = [
    { value: 'MON_WED_FRI', label: 'Monday, Wednesday, Friday' },
    { value: 'TUE_THU', label: 'Tuesday, Thursday' },
    { value: 'WEEKDAYS', label: 'Weekdays only' },
    { value: 'WEEKENDS', label: 'Weekends only' },
    { value: 'ALTERNATE_WEEKS', label: 'Alternate weeks' }
  ];

  return (
    <div className="space-y-6">
      {/* Recurrence Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Recurrence Pattern
          </CardTitle>
          <CardDescription>
            Set how often this schedule repeats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recurrence-type">Recurrence Type</Label>
            <Select value={recurrenceType} onValueChange={onRecurrenceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select recurrence pattern" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Pattern Selection */}
          {recurrenceType === 'CUSTOM' && (
            <div className="space-y-2">
              <Label htmlFor="custom-pattern">Custom Pattern</Label>
              <Select value={customPattern || ''} onValueChange={onCustomPatternChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select custom pattern" />
                </SelectTrigger>
                <SelectContent>
                  {customPatterns.map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Effective Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Effective Period
          </CardTitle>
          <CardDescription>
            Set when this schedule is active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective-from">Effective From</Label>
              <Input
                id="effective-from"
                type="date"
                value={effectiveFrom ? effectiveFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => onEffectiveFromChange(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective-until">Effective Until</Label>
              <Input
                id="effective-until"
                type="date"
                value={effectiveUntil ? effectiveUntil.toISOString().split('T')[0] : ''}
                onChange={(e) => onEffectiveUntilChange(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Template Settings
          </CardTitle>
          <CardDescription>
            Save this schedule as a reusable template. When enabled, a new template will be created in the Templates tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="is-template"
              checked={isTemplate}
              onCheckedChange={onTemplateChange}
            />
            <Label htmlFor="is-template">Save as template</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
