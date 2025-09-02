"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  onSuccess: () => void;
}

const doctorTypes = [
  { value: "FULL", label: "Full-Time" },
  { value: "PART", label: "Part-Time" },
];

const specializations = [
  { value: "CARDIOLOGY", label: "Cardiology", department: "Cardiology" },
  { value: "NEUROLOGY", label: "Neurology", department: "Neurology" },
  { value: "ORTHOPEDICS", label: "Orthopedics", department: "Orthopedics" },
  { value: "PEDIATRICS", label: "Pediatrics", department: "Pediatrics" },
  { value: "ONCOLOGY", label: "Oncology", department: "Oncology" },
  { value: "EMERGENCY_MEDICINE", label: "Emergency Medicine", department: "Emergency Medicine" },
  { value: "INTERNAL_MEDICINE", label: "Internal Medicine", department: "Internal Medicine" },
  { value: "SURGERY", label: "Surgery", department: "Surgery" },
  { value: "RADIOLOGY", label: "Radiology", department: "Radiology" },
  { value: "PATHOLOGY", label: "Pathology", department: "Pathology" },
];

export const AddDoctorDialog = ({ open, onOpenChange, departmentId, onSuccess }: AddDoctorDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    address: "",
    type: "FULL",
    license_number: "",
    emergency_contact: "",
    emergency_phone: "",
    qualifications: "",
    experience_years: "0",
    consultation_fee: "0",
    max_patients_per_day: "20",
    preferred_appointment_duration: "30",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.specialization) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          department_id: departmentId,
          experience_years: parseInt(formData.experience_years),
          consultation_fee: parseFloat(formData.consultation_fee),
          max_patients_per_day: parseInt(formData.max_patients_per_day),
          preferred_appointment_duration: parseInt(formData.preferred_appointment_duration),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Doctor added successfully');
          onOpenChange(false);
          setFormData({
            name: "",
            email: "",
            phone: "",
            specialization: "",
            address: "",
            type: "FULL",
            license_number: "",
            emergency_contact: "",
            emergency_phone: "",
            qualifications: "",
            experience_years: "0",
            consultation_fee: "0",
            max_patients_per_day: "20",
            preferred_appointment_duration: "30",
            password: "",
          });
          onSuccess();
        } else {
          toast.error(data.message || 'Failed to add doctor');
        }
      } else {
        toast.error('Failed to add doctor');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error('Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Doctor</DialogTitle>
          <DialogDescription>
            Add a new doctor to this department
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. John Doe"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="specialization">Specialization *</Label>
            <Select
              value={formData.specialization}
              onValueChange={(value) => setFormData({ ...formData, specialization: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec.value} value={spec.value}>
                    {spec.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="type">Employment Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {doctorTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@hospital.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="1234567890"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State"
            />
          </div>
          
          <div>
            <Label htmlFor="license_number">Medical License Number *</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              placeholder="Medical license number"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="qualifications">Qualifications</Label>
            <Input
              id="qualifications"
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              placeholder="MD, MBBS, etc."
            />
          </div>
          
          <div>
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              placeholder="5"
            />
          </div>
          
          <div>
            <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
            <Input
              id="consultation_fee"
              type="number"
              min="0"
              step="0.01"
              value={formData.consultation_fee}
              onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
              placeholder="100.00"
            />
          </div>
          
          <div>
            <Label htmlFor="emergency_contact">Emergency Contact Name</Label>
            <Input
              id="emergency_contact"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              placeholder="Emergency contact person"
            />
          </div>
          
          <div>
            <Label htmlFor="emergency_phone">Emergency Phone</Label>
            <Input
              id="emergency_phone"
              value={formData.emergency_phone}
              onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
              placeholder="Emergency phone number"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave empty for auto-generated password"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Doctor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
