'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditFacilityFormProps {
  facility: any;
}

export function EditFacilityForm({ facility }: EditFacilityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: facility.name,
    legal_name: facility.legal_name,
    address: facility.address,
    city: facility.city,
    state: facility.state,
    zip_code: facility.zip_code,
    phone: facility.phone,
    email: facility.email,
    website: facility.website || '',
    primary_color: facility.primary_color,
    secondary_color: facility.secondary_color,
    accent_color: facility.accent_color,
    timezone: facility.timezone,
    language: facility.language,
    currency: facility.currency,
    default_open_time: facility.default_open_time,
    default_close_time: facility.default_close_time,
    max_doctors: facility.max_doctors,
    max_patients: facility.max_patients,
    status: facility.status,
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/super-admin/facilities/${facility.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Facility updated successfully!');
        router.push(`/super-admin/facilities/${facility.id}`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update facility');
      }
    } catch (error) {
      toast.error('Failed to update facility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Facility Details
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Facility</h1>
          <p className="text-gray-600 mt-1">Update {facility.name} information</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Facility Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="facility_code">Facility Code</Label>
                  <Input
                    id="facility_code"
                    value={facility.facility_code}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Code cannot be changed</p>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="legal_name">Legal Name *</Label>
                  <Input
                    id="legal_name"
                    value={formData.legal_name}
                    onChange={(e) => handleChange('legal_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Subdomain Slug</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="slug"
                      value={facility.slug}
                      disabled
                      className="bg-gray-50"
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">.ihosi.com</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Slug cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">Zip Code *</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => handleChange('zip_code', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="h-12 cursor-pointer"
                  />
                </div>
                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="h-12 cursor-pointer"
                  />
                </div>
                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <Input
                    id="accent_color"
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="h-12 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Facility Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={formData.timezone}
                    onValueChange={(value) => handleChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={formData.language}
                    onValueChange={(value) => handleChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="default_open_time">Default Open Time</Label>
                  <Input
                    id="default_open_time"
                    type="time"
                    value={formData.default_open_time}
                    onChange={(e) => handleChange('default_open_time', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="default_close_time">Default Close Time</Label>
                  <Input
                    id="default_close_time"
                    type="time"
                    value={formData.default_close_time}
                    onChange={(e) => handleChange('default_close_time', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="max_doctors">Max Doctors</Label>
                  <Input
                    id="max_doctors"
                    type="number"
                    value={formData.max_doctors}
                    onChange={(e) => handleChange('max_doctors', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_patients">Max Patients</Label>
                  <Input
                    id="max_patients"
                    type="number"
                    value={formData.max_patients}
                    onChange={(e) => handleChange('max_patients', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

