/**
 * Schedule Template Manager Component
 * 
 * Manages schedule templates for doctors
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Edit, 
  Star,
  Clock,
  Calendar
} from 'lucide-react';
import { WorkingDay } from '@/types/schedule-types';

interface ScheduleTemplate {
  id: number;
  name: string;
  description: string;
  templateType: 'STANDARD' | 'PART_TIME' | 'EMERGENCY' | 'SURGERY' | 'CUSTOM';
  workingDays: WorkingDay[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateManagerProps {
  doctorId: string;
  onTemplateSelect: (template: ScheduleTemplate) => void;
  onTemplateSave: (template: Omit<ScheduleTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTemplateDelete: (templateId: number) => void;
}

export const ScheduleTemplateManager: React.FC<TemplateManagerProps> = ({
  doctorId,
  onTemplateSelect,
  onTemplateSave,
  onTemplateDelete
}) => {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    templateType: 'STANDARD' as const
  });

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [doctorId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/doctors/${doctorId}/schedule/templates`);
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.data);
      } else {
        setError(data.message || 'Failed to load templates');
      }
    } catch (err) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/doctors/${doctorId}/schedule/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });

      const data = await response.json();
      
      if (data.success) {
        setTemplates(prev => [...prev, data.data]);
        setNewTemplate({ name: '', description: '', templateType: 'STANDARD' });
        setShowCreateForm(false);
      } else {
        setError(data.message || 'Failed to create template');
      }
    } catch (err) {
      setError('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/doctors/${doctorId}/schedule/templates/${templateId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      } else {
        setError(data.message || 'Failed to delete template');
      }
    } catch (err) {
      setError('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async (template: ScheduleTemplate) => {
    console.log('=== APPLYING TEMPLATE ===');
    console.log('Template:', template);
    console.log('Doctor ID:', doctorId);
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const requestBody = {
        templateId: template.id
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch(`/api/doctors/${doctorId}/schedule/apply-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);
      
      if (result.success) {
        setSuccess(`Template "${template.name}" applied successfully!`);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
        // Reload templates to refresh the list
        await loadTemplates();
      } else {
        console.error('Template apply failed:', result.message);
        setError(result.message || 'Failed to apply template');
      }
    } catch (err) {
      console.error('Template apply error:', err);
      setError('Failed to apply template');
    } finally {
      setLoading(false);
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'bg-blue-100 text-blue-800';
      case 'PART_TIME': return 'bg-green-100 text-green-800';
      case 'EMERGENCY': return 'bg-red-100 text-red-800';
      case 'SURGERY': return 'bg-purple-100 text-purple-800';
      case 'CUSTOM': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Schedule Templates</h3>
          <p className="text-sm text-muted-foreground">
            Manage reusable schedule templates
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Create Template Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
            <CardDescription>
              Save your current schedule as a reusable template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Standard Schedule"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Regular 9-5 schedule with lunch break"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-type">Template Type</Label>
              <Select
                value={newTemplate.templateType}
                onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, templateType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="PART_TIME">Part-time</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  <SelectItem value="SURGERY">Surgery</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTemplate} disabled={!newTemplate.name.trim()}>
                Create Template
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {template.name}
                    {template.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
                  </CardTitle>
                  <Badge className={getTemplateTypeColor(template.templateType)}>
                    {template.templateType.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApplyTemplate(template)}
                    disabled={loading}
                  >
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onTemplateSelect(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                {template.description || 'No description'}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {template.workingDays.length} working days
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first schedule template to get started
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
