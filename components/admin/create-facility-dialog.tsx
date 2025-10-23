'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Building2, User, Palette, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFacilityDialog({ open, onOpenChange }: CreateFacilityDialogProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'facility' | 'admin' | 'complete'>('facility');
  const [loading, setLoading] = useState(false);
  const [createdFacilityId, setCreatedFacilityId] = useState<string | null>(null);

  const [facilityData, setFacilityData] = useState({
    name: '',
    slug: '',
    legal_name: '',
    facility_code: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6',
    accent_color: '#10b981',
    timezone: 'America/New_York',
  });

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleFacilityChange = (field: string, value: string) => {
    setFacilityData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && !facilityData.slug) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFacilityData(prev => ({ ...prev, slug }));
    }
  };

  const handleCreateFacility = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/super-admin/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facilityData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Facility created successfully!');
        setCreatedFacilityId(result.facility.id);
        setCurrentStep('admin');
      } else {
        toast.error(result.error || 'Failed to create facility');
      }
    } catch (error) {
      toast.error('Failed to create facility');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (adminData.password !== adminData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (adminData.password.length < 12) {
      toast.error('Password must be at least 12 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/super-admin/facility-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adminData,
          facility_id: createdFacilityId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Facility admin created successfully!');
        setCurrentStep('complete');
      } else {
        toast.error(result.error || 'Failed to create admin');
      }
    } catch (error) {
      toast.error('Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('facility');
    setFacilityData({
      name: '',
      slug: '',
      legal_name: '',
      facility_code: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      website: '',
      primary_color: '#3b82f6',
      secondary_color: '#8b5cf6',
      accent_color: '#10b981',
      timezone: 'America/New_York',
    });
    setAdminData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setCreatedFacilityId(null);
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Facility
          </DialogTitle>
          <DialogDescription>
            Step {currentStep === 'facility' ? '1' : currentStep === 'admin' ? '2' : '3'} of 3
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="facility" disabled={currentStep !== 'facility'}>
              <Building2 className="h-4 w-4 mr-2" />
              Facility Info
            </TabsTrigger>
            <TabsTrigger value="admin" disabled={currentStep === 'facility'}>
              <User className="h-4 w-4 mr-2" />
              Create Admin
            </TabsTrigger>
            <TabsTrigger value="complete" disabled={currentStep !== 'complete'}>
              <Check className="h-4 w-4 mr-2" />
              Complete
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Facility Information */}
          <TabsContent value="facility" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  value={facilityData.name}
                  onChange={(e) => handleFacilityChange('name', e.target.value)}
                  placeholder="Mayo Clinic"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="slug">Subdomain Slug *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="slug"
                    value={facilityData.slug}
                    onChange={(e) => handleFacilityChange('slug', e.target.value)}
                    placeholder="mayo-clinic"
                    required
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">.ihosi.com</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  URL: https://{facilityData.slug || 'facility-name'}.ihosi.com
                </p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="legal_name">Legal Name *</Label>
                <Input
                  id="legal_name"
                  value={facilityData.legal_name}
                  onChange={(e) => handleFacilityChange('legal_name', e.target.value)}
                  placeholder="Mayo Clinic Health System"
                  required
                />
              </div>

              <div>
                <Label htmlFor="facility_code">Facility Code *</Label>
                <Input
                  id="facility_code"
                  value={facilityData.facility_code}
                  onChange={(e) => handleFacilityChange('facility_code', e.target.value)}
                  placeholder="MC001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={facilityData.phone}
                  onChange={(e) => handleFacilityChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={facilityData.email}
                  onChange={(e) => handleFacilityChange('email', e.target.value)}
                  placeholder="admin@facility.com"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={facilityData.address}
                  onChange={(e) => handleFacilityChange('address', e.target.value)}
                  placeholder="123 Medical Center Drive"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={facilityData.city}
                  onChange={(e) => handleFacilityChange('city', e.target.value)}
                  placeholder="Boston"
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={facilityData.state}
                  onChange={(e) => handleFacilityChange('state', e.target.value)}
                  placeholder="MA"
                  required
                />
              </div>

              <div>
                <Label htmlFor="zip_code">Zip Code *</Label>
                <Input
                  id="zip_code"
                  value={facilityData.zip_code}
                  onChange={(e) => handleFacilityChange('zip_code', e.target.value)}
                  placeholder="02101"
                  required
                />
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={facilityData.timezone}
                  onValueChange={(value) => handleFacilityChange('timezone', value)}
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

              <div className="col-span-2">
                <Label><Palette className="h-4 w-4 inline mr-2" />Branding Colors</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="primary_color" className="text-xs">Primary</Label>
                    <Input
                      id="primary_color"
                      type="color"
                      value={facilityData.primary_color}
                      onChange={(e) => handleFacilityChange('primary_color', e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary_color" className="text-xs">Secondary</Label>
                    <Input
                      id="secondary_color"
                      type="color"
                      value={facilityData.secondary_color}
                      onChange={(e) => handleFacilityChange('secondary_color', e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accent_color" className="text-xs">Accent</Label>
                    <Input
                      id="accent_color"
                      type="color"
                      value={facilityData.accent_color}
                      onChange={(e) => handleFacilityChange('accent_color', e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateFacility} 
                disabled={loading || !facilityData.name || !facilityData.slug}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Next: Create Admin'
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Step 2: Create Admin */}
          <TabsContent value="admin" className="space-y-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>{facilityData.name}</strong> created successfully! Now create an admin for this facility.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                URL: https://{facilityData.slug}.ihosi.com
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="admin_name">Admin Name *</Label>
                <Input
                  id="admin_name"
                  value={adminData.name}
                  onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="admin_email">Admin Email *</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  placeholder="admin@facility.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="admin_password">Password *</Label>
                <Input
                  id="admin_password"
                  type="password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  placeholder="Minimum 12 characters"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 12 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <Label htmlFor="admin_confirm_password">Confirm Password *</Label>
                <Input
                  id="admin_confirm_password"
                  type="password"
                  value={adminData.confirmPassword}
                  onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setCurrentStep('facility')}>
                Back
              </Button>
              <Button 
                onClick={handleCreateAdmin} 
                disabled={loading || !adminData.name || !adminData.email || !adminData.password}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Admin...
                  </>
                ) : (
                  'Create Admin'
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Step 3: Complete */}
          <TabsContent value="complete" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Facility Created Successfully!
              </h3>
              
              <div className="bg-gray-50 p-6 rounded-lg mt-6 text-left space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">Setup Complete:</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Facility Name:</span>
                    <span className="text-sm font-medium">{facilityData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subdomain:</span>
                    <span className="text-sm font-medium">{facilityData.slug}.ihosi.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Admin Email:</span>
                    <span className="text-sm font-medium">{adminData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Primary Color:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: facilityData.primary_color }}
                      />
                      <span className="text-sm font-medium">{facilityData.primary_color}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>Admin can login at: <strong>https://{facilityData.slug}.ihosi.com</strong></li>
                  <li>Use credentials: <strong>{adminData.email}</strong></li>
                  <li>Admin can then manage doctors, staff, and patients for this facility</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

