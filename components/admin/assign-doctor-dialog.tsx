'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2, UserPlus, Users } from 'lucide-react';
import { useFacility } from '@/lib/facility-context';
import { toast } from 'sonner';

interface AssignDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AssignDoctorDialog({ open, onOpenChange, onSuccess }: AssignDoctorDialogProps) {
  const facility = useFacility();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('new');
  
  // Form for new doctor
  const [newDoctorData, setNewDoctorData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    license_number: '',
    qualifications: '',
    experience_years: 0,
    languages: ['English'],
    consultation_fee: 100,
    emergency_contact: '',
    emergency_phone: '',
    employment_type: 'FULL_TIME',
    department_id: '',
    office_number: '',
    accepts_new_patients: true,
    online_booking_enabled: true,
    status: 'ACTIVE',
    is_primary_facility: false,
  });

  // Form for existing doctor
  const [existingDoctorData, setExistingDoctorData] = useState({
    doctor_id: '',
    employment_type: 'FULL_TIME',
    department_id: '',
    office_number: '',
    accepts_new_patients: true,
    online_booking_enabled: true,
    status: 'ACTIVE',
    is_primary_facility: false,
  });

  const brandColor = facility?.branding?.primaryColor || facility?.primary_color || '#3b82f6';

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments');
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = activeTab === 'new' ? newDoctorData : existingDoctorData;
      
      const response = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign doctor');
      }

      if (data.default_password) {
        toast.success(
          `Doctor added successfully! Default password: ${data.default_password}`,
          { duration: 10000 }
        );
      } else {
        toast.success('Doctor assigned to facility successfully!');
      }
      
      // Reset forms
      setNewDoctorData({
        name: '',
        email: '',
        phone: '',
        address: '',
        specialization: '',
        license_number: '',
        qualifications: '',
        experience_years: 0,
        languages: ['English'],
        consultation_fee: 100,
        emergency_contact: '',
        emergency_phone: '',
        employment_type: 'FULL_TIME',
        department_id: '',
        office_number: '',
        accepts_new_patients: true,
        online_booking_enabled: true,
        status: 'ACTIVE',
        is_primary_facility: false,
      });

      setExistingDoctorData({
        doctor_id: '',
        employment_type: 'FULL_TIME',
        department_id: '',
        office_number: '',
        accepts_new_patients: true,
        online_booking_enabled: true,
        status: 'ACTIVE',
        is_primary_facility: false,
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error assigning doctor:', error);
      toast.error(error.message || 'Failed to assign doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" style={{ color: brandColor }} />
            Assign Doctor to Facility
          </DialogTitle>
          <DialogDescription>
            Add a doctor to {facility?.name || 'your facility'} - create new or assign existing
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Doctor
            </TabsTrigger>
            <TabsTrigger value="existing">
              <Users className="h-4 w-4 mr-2" />
              Assign Existing Doctor
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Create New Doctor */}
          <TabsContent value="new">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={newDoctorData.name}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, name: e.target.value })}
                      placeholder="Dr. John Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newDoctorData.email}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, email: e.target.value })}
                      placeholder="doctor@facility.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newDoctorData.phone}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">
                      Specialization <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="specialization"
                      value={newDoctorData.specialization}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, specialization: e.target.value })}
                      placeholder="e.g., Cardiology"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={newDoctorData.address}
                    onChange={(e) => setNewDoctorData({ ...newDoctorData, address: e.target.value })}
                    placeholder="123 Medical Plaza, City, State"
                    required
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Professional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license_number">
                      License Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="license_number"
                      value={newDoctorData.license_number}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, license_number: e.target.value })}
                      placeholder="MD12345"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Experience (Years)</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={newDoctorData.experience_years}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, experience_years: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">
                    Qualifications <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="qualifications"
                    value={newDoctorData.qualifications}
                    onChange={(e) => setNewDoctorData({ ...newDoctorData, qualifications: e.target.value })}
                    placeholder="MD, FACC, Board Certified"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
                    <Input
                      id="consultation_fee"
                      type="number"
                      value={newDoctorData.consultation_fee}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, consultation_fee: parseFloat(e.target.value) || 100 })}
                      min="0"
                      step="0.01"
                      placeholder="100.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages (comma-separated)</Label>
                    <Input
                      id="languages"
                      value={newDoctorData.languages.join(', ')}
                      onChange={(e) => setNewDoctorData({ 
                        ...newDoctorData, 
                        languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean) 
                      })}
                      placeholder="English, Spanish"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Emergency Contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">
                      Emergency Contact Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergency_contact"
                      value={newDoctorData.emergency_contact}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, emergency_contact: e.target.value })}
                      placeholder="Emergency contact name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">
                      Emergency Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergency_phone"
                      type="tel"
                      value={newDoctorData.emergency_phone}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, emergency_phone: e.target.value })}
                      placeholder="(555) 987-6543"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Facility Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Facility Assignment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select
                      value={newDoctorData.employment_type}
                      onValueChange={(value) => setNewDoctorData({ ...newDoctorData, employment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                        <SelectItem value="PART_TIME">Part-Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="VISITING">Visiting</SelectItem>
                        <SelectItem value="LOCUM_TENENS">Locum Tenens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department_id_new">Department</Label>
                    <Select
                      value={newDoctorData.department_id || undefined}
                      onValueChange={(value) => setNewDoctorData({ ...newDoctorData, department_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newDoctorData.department_id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewDoctorData({ ...newDoctorData, department_id: '' })}
                        className="text-xs text-gray-500"
                      >
                        Clear department
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="office_number">Office Number</Label>
                    <Input
                      id="office_number"
                      value={newDoctorData.office_number}
                      onChange={(e) => setNewDoctorData({ ...newDoctorData, office_number: e.target.value })}
                      placeholder="Room 301"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newDoctorData.status}
                      onValueChange={(value) => setNewDoctorData({ ...newDoctorData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accepts_new_patients"
                      checked={newDoctorData.accepts_new_patients}
                      onCheckedChange={(checked) => 
                        setNewDoctorData({ ...newDoctorData, accepts_new_patients: checked as boolean })
                      }
                    />
                    <Label htmlFor="accepts_new_patients" className="text-sm font-normal cursor-pointer">
                      Accepting new patients
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="online_booking_enabled"
                      checked={newDoctorData.online_booking_enabled}
                      onCheckedChange={(checked) => 
                        setNewDoctorData({ ...newDoctorData, online_booking_enabled: checked as boolean })
                      }
                    />
                    <Label htmlFor="online_booking_enabled" className="text-sm font-normal cursor-pointer">
                      Enable online booking
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_primary_facility"
                      checked={newDoctorData.is_primary_facility}
                      onCheckedChange={(checked) => 
                        setNewDoctorData({ ...newDoctorData, is_primary_facility: checked as boolean })
                      }
                    />
                    <Label htmlFor="is_primary_facility" className="text-sm font-normal cursor-pointer">
                      This is the doctor's primary facility
                    </Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: brandColor, color: 'white' }}
                  className="hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create & Assign Doctor
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Tab 2: Assign Existing Doctor */}
          <TabsContent value="existing">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This feature allows you to assign an existing doctor from the system to this facility.
                  The doctor will maintain their existing profile but will be linked to your facility.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor_id">
                  Select Doctor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="doctor_id"
                  value={existingDoctorData.doctor_id}
                  onChange={(e) => setExistingDoctorData({ ...existingDoctorData, doctor_id: e.target.value })}
                  placeholder="Enter doctor ID"
                  required
                />
                <p className="text-xs text-gray-500">
                  Enter the ID of an existing doctor in the system
                </p>
              </div>

              {/* Facility Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Facility Assignment Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employment_type_existing">Employment Type</Label>
                    <Select
                      value={existingDoctorData.employment_type}
                      onValueChange={(value) => setExistingDoctorData({ ...existingDoctorData, employment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                        <SelectItem value="PART_TIME">Part-Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="VISITING">Visiting</SelectItem>
                        <SelectItem value="LOCUM_TENENS">Locum Tenens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department_id_existing">Department</Label>
                    <Select
                      value={existingDoctorData.department_id || undefined}
                      onValueChange={(value) => setExistingDoctorData({ ...existingDoctorData, department_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office_number_existing">Office Number</Label>
                  <Input
                    id="office_number_existing"
                    value={existingDoctorData.office_number}
                    onChange={(e) => setExistingDoctorData({ ...existingDoctorData, office_number: e.target.value })}
                    placeholder="Room 301"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accepts_new_patients_existing"
                      checked={existingDoctorData.accepts_new_patients}
                      onCheckedChange={(checked) => 
                        setExistingDoctorData({ ...existingDoctorData, accepts_new_patients: checked as boolean })
                      }
                    />
                    <Label htmlFor="accepts_new_patients_existing" className="text-sm font-normal cursor-pointer">
                      Accepting new patients
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="online_booking_enabled_existing"
                      checked={existingDoctorData.online_booking_enabled}
                      onCheckedChange={(checked) => 
                        setExistingDoctorData({ ...existingDoctorData, online_booking_enabled: checked as boolean })
                      }
                    />
                    <Label htmlFor="online_booking_enabled_existing" className="text-sm font-normal cursor-pointer">
                      Enable online booking
                    </Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: brandColor, color: 'white' }}
                  className="hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign to Facility
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}




