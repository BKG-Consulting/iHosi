"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Plus, Search, FileText, Edit, Trash2, Eye, Clock, Users, Building2, Filter
} from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: number;
  service_name: string;
  price: number;
  duration_minutes?: number;
  category?: string;
}

interface ServiceTemplateItem {
  id: string;
  service_id: number;
  quantity: number;
  is_required: boolean;
  order_index: number;
  service: Service;
}

interface ServiceTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  department_id?: string;
  is_active: boolean;
  template_items: ServiceTemplateItem[];
  department?: {
    id: string;
    name: string;
    code: string;
  };
  created_at: string;
  updated_at: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const templateCategories = [
  { value: "Emergency", label: "Emergency Procedures" },
  { value: "Routine", label: "Routine Checkups" },
  { value: "Specialized", label: "Specialized Care" },
  { value: "Diagnostic", label: "Diagnostic Tests" },
  { value: "Therapeutic", label: "Therapeutic Procedures" },
  { value: "Preventive", label: "Preventive Care" },
  { value: "Rehabilitation", label: "Rehabilitation" },
  { value: "Surgical", label: "Surgical Procedures" }
];

export const ServiceTemplatesManagement = () => {
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    department_id: "none"
  });

  const [selectedServices, setSelectedServices] = useState<Array<{
    service_id: number;
    quantity: number;
    is_required: boolean;
    order_index: number;
  }>>([]);

  useEffect(() => {
    fetchTemplates();
    fetchServices();
    fetchDepartments();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/service-templates?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTemplates(data.templates || []);
        }
      }
    } catch (error) {
      console.error('Error fetching service templates:', error);
      toast.error('Failed to load service templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setServices(data.allServices || []);
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDepartments(data.departments || []);
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || selectedServices.length === 0) {
      toast.error('Please provide template name, category, and select at least one service');
      return;
    }

    try {
      const response = await fetch('/api/service-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          services: selectedServices,
          department_id: formData.department_id === "none" ? null : formData.department_id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Service template created successfully');
          setIsAddDialogOpen(false);
          setFormData({ name: "", description: "", category: "", department_id: "none" });
          setSelectedServices([]);
          fetchTemplates();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create service template');
      }
    } catch (error) {
      console.error('Error creating service template:', error);
      toast.error('Failed to create service template');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this service template?')) return;

    try {
      const response = await fetch(`/api/service-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Service template deleted successfully');
          fetchTemplates();
        } else {
          toast.error(data.message || 'Failed to delete service template');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete service template');
      }
    } catch (error) {
      console.error('Error deleting service template:', error);
      toast.error('Failed to delete service template');
    }
  };

  const addServiceToTemplate = (serviceId: number) => {
    const existingService = selectedServices.find(s => s.service_id === serviceId);
    if (existingService) {
      setSelectedServices(prev => 
        prev.map(s => 
          s.service_id === serviceId 
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      );
    } else {
      setSelectedServices(prev => [...prev, {
        service_id: serviceId,
        quantity: 1,
        is_required: true,
        order_index: selectedServices.length
      }]);
    }
  };

  const removeServiceFromTemplate = (serviceId: number) => {
    setSelectedServices(prev => {
      const filtered = prev.filter(s => s.service_id !== serviceId);
      // Reorder remaining services
      return filtered.map((service, index) => ({
        ...service,
        order_index: index
      }));
    });
  };

  const updateServiceQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeServiceFromTemplate(serviceId);
      return;
    }
    
    setSelectedServices(prev => 
      prev.map(s => 
        s.service_id === serviceId 
          ? { ...s, quantity }
          : s
      )
    );
  };

  const moveServiceUp = (serviceId: number) => {
    setSelectedServices(prev => {
      const serviceIndex = prev.findIndex(s => s.service_id === serviceId);
      if (serviceIndex > 0) {
        const newServices = [...prev];
        [newServices[serviceIndex - 1], newServices[serviceIndex]] = 
        [newServices[serviceIndex], newServices[serviceIndex - 1]];
        return newServices.map((service, index) => ({
          ...service,
          order_index: index
        }));
      }
      return prev;
    });
  };

  const moveServiceDown = (serviceId: number) => {
    setSelectedServices(prev => {
      const serviceIndex = prev.findIndex(s => s.service_id === serviceId);
      if (serviceIndex < prev.length - 1) {
        const newServices = [...prev];
        [newServices[serviceIndex], newServices[serviceIndex + 1]] = 
        [newServices[serviceIndex + 1], newServices[serviceIndex]];
        return newServices.map((service, index) => ({
          ...service,
          order_index: index
        }));
      }
      return prev;
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Emergency: "bg-red-100 text-red-800",
      Routine: "bg-blue-100 text-blue-800",
      Specialized: "bg-purple-100 text-purple-800",
      Diagnostic: "bg-green-100 text-green-800",
      Therapeutic: "bg-yellow-100 text-yellow-800",
      Preventive: "bg-indigo-100 text-indigo-800",
      Rehabilitation: "bg-pink-100 text-pink-800",
      Surgical: "bg-orange-100 text-orange-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Templates Management</h1>
          <p className="text-gray-600">Create and manage service templates for common procedures</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Service Template</DialogTitle>
              <DialogDescription>
                Create a template for common service procedures
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Emergency Triage Protocol"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="department">Department (Optional)</Label>
                <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="template_description">Description</Label>
                <Textarea
                  id="template_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Template description and usage guidelines"
                />
              </div>

              {/* Available Services */}
              <div>
                <Label>Available Services</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <span className="font-medium">{service.service_name}</span>
                        <span className="text-sm text-gray-500 ml-2">${service.price}</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addServiceToTemplate(service.id)}
                        className="ml-2"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Services */}
              {selectedServices.length > 0 && (
                <div>
                  <Label>Selected Services (in order)</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {selectedServices
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((item) => {
                        const service = services.find(s => s.id === item.service_id);
                        if (!service) return null;
                        
                        return (
                          <div key={item.service_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">#{item.order_index + 1}</span>
                              <div className="flex-1">
                                <span className="font-medium">{service.service_name}</span>
                                <span className="text-sm text-gray-500 ml-2">${service.price}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => moveServiceUp(item.service_id)}
                                disabled={item.order_index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => moveServiceDown(item.service_id)}
                                disabled={item.order_index === selectedServices.length - 1}
                              >
                                ↓
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateServiceQuantity(item.service_id, parseInt(e.target.value) || 1)}
                                className="w-16"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => removeServiceFromTemplate(item.service_id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Template</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search service templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {templateCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Templates ({filteredTemplates.length})</CardTitle>
          <CardDescription>
            All available service templates for common procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No service templates found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {template.department ? (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{template.department.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">General</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>{template.template_items.length} services</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
