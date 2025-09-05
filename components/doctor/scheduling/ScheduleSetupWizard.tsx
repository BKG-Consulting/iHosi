"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Settings, Plus, Trash2, Save } from 'lucide-react';
import { ScheduleTemplate, ScheduleBlock } from '@/utils/services/doctor-scheduling';

interface ScheduleSetupWizardProps {
  doctorId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const ScheduleSetupWizard: React.FC<ScheduleSetupWizardProps> = ({
  doctorId,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [scheduleData, setScheduleData] = useState({
    name: '',
    description: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_default: true,
  });

  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addTemplate = () => {
    const newTemplate: ScheduleTemplate = {
      id: `temp_${Date.now()}`,
      name: '',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
      is_working: true,
      appointment_duration: 30,
      buffer_time: 15,
    };
    setTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (index: number, field: keyof ScheduleTemplate, value: any) => {
    const updatedTemplates = [...templates];
    updatedTemplates[index] = { ...updatedTemplates[index], [field]: value };
    setTemplates(updatedTemplates);
  };

  const removeTemplate = (index: number) => {
    setTemplates(templates.filter((_, i) => i !== index));
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (data.oauthUrl) {
        window.location.href = data.oauthUrl;
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Save schedule and templates
      console.log('Saving schedule:', { scheduleData, templates, blocks });
      onComplete();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Setup Wizard
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Step {currentStep} of 4</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={currentStep.toString()} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="1">Basic Info</TabsTrigger>
              <TabsTrigger value="2">Templates</TabsTrigger>
              <TabsTrigger value="3">Calendar</TabsTrigger>
              <TabsTrigger value="4">Review</TabsTrigger>
            </TabsList>

            {/* Step 1: Basic Information */}
            <TabsContent value="1" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Schedule Name</Label>
                    <Input
                      id="name"
                      value={scheduleData.name}
                      onChange={(e) => setScheduleData({ ...scheduleData, name: e.target.value })}
                      placeholder="e.g., Regular Schedule"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={scheduleData.timezone}
                      onValueChange={(value) => setScheduleData({ ...scheduleData, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                        <SelectItem value="Africa/Nairobi">Nairobi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={scheduleData.description}
                      onChange={(e) => setScheduleData({ ...scheduleData, description: e.target.value })}
                      placeholder="Optional description for this schedule"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="default"
                      checked={scheduleData.is_default}
                      onCheckedChange={(checked) => setScheduleData({ ...scheduleData, is_default: checked })}
                    />
                    <Label htmlFor="default">Set as default schedule</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Step 2: Schedule Templates */}
            <TabsContent value="2" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Weekly Schedule Templates</h3>
                <Button onClick={addTemplate} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Template
                </Button>
              </div>

              <div className="space-y-4">
                {templates.map((template, index) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div>
                          <Label>Day</Label>
                          <Select
                            value={template.day_of_week.toString()}
                            onValueChange={(value) => updateTemplate(index, 'day_of_week', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {daysOfWeek.map(day => (
                                <SelectItem key={day.value} value={day.value.toString()}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={template.start_time}
                            onChange={(e) => updateTemplate(index, 'start_time', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={template.end_time}
                            onChange={(e) => updateTemplate(index, 'end_time', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Duration (min)</Label>
                          <Input
                            type="number"
                            value={template.appointment_duration}
                            onChange={(e) => updateTemplate(index, 'appointment_duration', parseInt(e.target.value))}
                            min="15"
                            max="120"
                            step="15"
                          />
                        </div>

                        <div>
                          <Label>Buffer (min)</Label>
                          <Input
                            type="number"
                            value={template.buffer_time}
                            onChange={(e) => updateTemplate(index, 'buffer_time', parseInt(e.target.value))}
                            min="0"
                            max="30"
                            step="5"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={template.is_working}
                              onCheckedChange={(checked) => updateTemplate(index, 'is_working', checked)}
                            />
                            <Label className="text-sm">Working</Label>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTemplate(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {templates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No schedule templates</p>
                    <p className="text-sm">Add templates to define your weekly schedule</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Step 3: Calendar Integration */}
            <TabsContent value="3" className="space-y-6">
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Calendar Integration</h3>
                <p className="text-gray-600 mb-4">
                  Connect your Google Calendar to sync appointments and manage your schedule
                </p>
                <Button onClick={handleConnectGoogleCalendar}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Connect Google Calendar
                </Button>
              </div>
            </TabsContent>

            {/* Step 4: Review */}
            <TabsContent value="4" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Schedule Summary</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Name</Label>
                          <p className="font-medium">{scheduleData.name || 'Untitled Schedule'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Timezone</Label>
                          <p className="font-medium">{scheduleData.timezone}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Templates</Label>
                          <p className="font-medium">{templates.length} day(s)</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Default</Label>
                          <Badge variant={scheduleData.is_default ? 'default' : 'secondary'}>
                            {scheduleData.is_default ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {templates.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Schedule Templates</h3>
                    <div className="space-y-2">
                      {templates.map((template, index) => (
                        <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">
                              {daysOfWeek.find(d => d.value === template.day_of_week)?.label}
                            </Badge>
                            <span className="font-medium">
                              {template.start_time} - {template.end_time}
                            </span>
                            <span className="text-sm text-gray-600">
                              {template.appointment_duration}min slots
                            </span>
                          </div>
                          <Badge variant={template.is_working ? 'default' : 'secondary'}>
                            {template.is_working ? 'Working' : 'Off'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={currentStep === 1 ? onCancel : handlePrevious}>
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Schedule
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
