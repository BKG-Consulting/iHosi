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

interface AddWardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  onSuccess: () => void;
}

const wardTypes = [
  { value: "INTENSIVE_CARE", label: "Intensive Care Unit (ICU)" },
  { value: "GENERAL", label: "General Ward" },
  { value: "EMERGENCY", label: "Emergency Ward" },
  { value: "OPERATING_ROOM", label: "Operating Room" },
  { value: "RECOVERY", label: "Recovery Ward" },
  { value: "PEDIATRIC", label: "Pediatric Ward" },
  { value: "MATERNITY", label: "Maternity Ward" },
  { value: "PSYCHIATRIC", label: "Psychiatric Ward" },
  { value: "ISOLATION", label: "Isolation Ward" },
  { value: "STEP_DOWN", label: "Step-down Ward" }
];

const wardStatuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "QUARANTINE", label: "Quarantine" },
  { value: "CLOSED", label: "Closed" }
];

export const AddWardDialog = ({ open, onOpenChange, departmentId, onSuccess }: AddWardDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    floor: "",
    wing: "",
    capacity: "20",
    ward_type: "GENERAL",
    status: "ACTIVE"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/wards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          department_id: departmentId,
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          capacity: parseInt(formData.capacity)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Ward created successfully');
          onOpenChange(false);
          setFormData({
            name: "",
            floor: "",
            wing: "",
            capacity: "20",
            ward_type: "GENERAL",
            status: "ACTIVE"
          });
          onSuccess();
        } else {
          toast.error(data.message || 'Failed to create ward');
        }
      } else {
        toast.error('Failed to create ward');
      }
    } catch (error) {
      console.error('Error creating ward:', error);
      toast.error('Failed to create ward');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Ward</DialogTitle>
          <DialogDescription>
            Create a new ward and assign it to this department
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Ward Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., ICU Ward A"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="Floor number"
              />
            </div>
            <div>
              <Label htmlFor="wing">Wing</Label>
              <Input
                id="wing"
                value={formData.wing}
                onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                placeholder="e.g., North, South"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="capacity">Bed Capacity *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="20"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="ward_type">Ward Type *</Label>
            <Select
              value={formData.ward_type}
              onValueChange={(value) => setFormData({ ...formData, ward_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wardTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wardStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Ward"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
