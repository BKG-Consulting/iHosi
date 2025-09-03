"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, X } from "lucide-react";

interface EquipmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  departments?: Array<{ id: string; name: string }>;
  wards?: Array<{ id: string; name: string; department_id: string }>;
}

const equipmentTypes = [
  { value: "DIAGNOSTIC", label: "Diagnostic Equipment", description: "X-ray machines, MRI, CT scanners, ultrasound" },
  { value: "MONITORING", label: "Monitoring Equipment", description: "Patient monitors, ECG machines, pulse oximeters" },
  { value: "SURGICAL", label: "Surgical Equipment", description: "Surgical instruments, anesthesia machines, operating tables" },
  { value: "IMAGING", label: "Imaging Equipment", description: "Endoscopes, microscopes, imaging systems" },
  { value: "LABORATORY", label: "Laboratory Equipment", description: "Centrifuges, analyzers, microscopes, incubators" },
  { value: "THERAPEUTIC", label: "Therapeutic Equipment", description: "Dialysis machines, ventilators, infusion pumps" },
  { value: "SUPPORT", label: "Support Equipment", description: "Hospital beds, wheelchairs, stretchers" },
  { value: "TRANSPORT", label: "Transport Equipment", description: "Ambulances, patient transport systems" }
];

export default function EquipmentForm({ 
  onSuccess, 
  onCancel, 
  initialData, 
  departments = [], 
  wards = [] 
}: EquipmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    model: initialData?.model || "",
    serial_number: initialData?.serial_number || "",
    department_id: initialData?.department_id || "",
    ward_id: initialData?.ward_id || "",
    equipment_type: initialData?.equipment_type || "",
    manufacturer: initialData?.manufacturer || "",
    purchase_date: initialData?.purchase_date ? new Date(initialData.purchase_date).toISOString().split('T')[0] : "",
    warranty_expiry: initialData?.warranty_expiry ? new Date(initialData.warranty_expiry).toISOString().split('T')[0] : "",
    maintenance_cycle: initialData?.maintenance_cycle || "",
    notes: initialData?.notes || ""
  });

  const [selectedDepartment, setSelectedDepartment] = useState(formData.department_id || "none");
  const [filteredWards, setFilteredWards] = useState(
    wards.filter(ward => ward.department_id === selectedDepartment)
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value === "none" ? "" : value }));
    setError("");
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setFormData(prev => ({ ...prev, department_id: departmentId === "none" ? "" : departmentId, ward_id: "" }));
    setFilteredWards(wards.filter(ward => ward.department_id === departmentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.name || !formData.serial_number || !formData.equipment_type) {
        throw new Error("Name, serial number, and equipment type are required");
      }

      const payload = {
        ...formData,
        department_id: formData.department_id || null,
        ward_id: formData.ward_id || null,
        purchase_date: formData.purchase_date || null,
        warranty_expiry: formData.warranty_expiry || null,
        maintenance_cycle: formData.maintenance_cycle ? parseInt(formData.maintenance_cycle) : null
      };

      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create equipment');
      }

      setSuccess("Equipment created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        model: "",
        serial_number: "",
        department_id: "",
        ward_id: "",
        equipment_type: "",
        manufacturer: "",
        purchase_date: "",
        warranty_expiry: "",
        maintenance_cycle: "",
        notes: ""
      });
      setSelectedDepartment("none");

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Refresh the page data
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Save className="w-5 h-5 mr-2" />
          {initialData ? 'Edit Equipment' : 'Add New Equipment'}
        </CardTitle>
        <CardDescription>
          {initialData ? 'Update equipment information' : 'Add new medical equipment to the system'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., X-Ray Machine, Patient Monitor"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Model XYZ-2000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number *</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => handleInputChange('serial_number', e.target.value)}
                  placeholder="e.g., SN123456789"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="e.g., GE Healthcare, Philips"
                />
              </div>
            </div>
          </div>

          {/* Equipment Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Equipment Classification</h3>
            <div className="space-y-2">
              <Label htmlFor="equipment_type">Equipment Type *</Label>
              <Select value={formData.equipment_type} onValueChange={(value) => handleInputChange('equipment_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Select 
                  value={formData.ward_id} 
                  onValueChange={(value) => handleInputChange('ward_id', value)}
                  disabled={!selectedDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedDepartment ? "Select ward" : "Select department first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Ward</SelectItem>
                    {filteredWards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dates and Maintenance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Dates & Maintenance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => handleInputChange('warranty_expiry', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance_cycle">Maintenance Cycle (days)</Label>
                <Input
                  id="maintenance_cycle"
                  type="number"
                  value={formData.maintenance_cycle}
                  onChange={(e) => handleInputChange('maintenance_cycle', e.target.value)}
                  placeholder="e.g., 90"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about this equipment..."
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {initialData ? 'Update Equipment' : 'Create Equipment'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
