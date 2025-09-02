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
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, DollarSign,
  Stethoscope, Microscope, Pill, Activity, Heart, Brain
} from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: number;
  service_name: string;
  description: string;
  price: number;
  created_at: string;
}

const serviceCategories = [
  { label: "All Services", value: "all", icon: Stethoscope },
  { label: "Cardiology", value: "Cardiology", icon: Heart },
  { label: "Neurology", value: "Neurology", icon: Brain },
  { label: "Laboratory", value: "Laboratory", icon: Microscope },
  { label: "Pharmacy", value: "Pharmacy", icon: Pill },
  { label: "General", value: "General", icon: Activity }
];

export const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    price: ""
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Flatten categorized services for display
          const allServices = Object.values(data.services).flat();
          setServices(allServices);
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_name || !formData.description || !formData.price) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Service created successfully');
          setIsAddDialogOpen(false);
          setFormData({ service_name: "", description: "", price: "" });
          fetchServices();
        }
      } else {
        toast.error('Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Service deleted successfully');
        fetchServices();
      } else {
        toast.error('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || 
                           service.service_name.startsWith(categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (serviceName: string) => {
    const category = serviceName.split(' ')[0];
    const categoryConfig = serviceCategories.find(cat => cat.value === category);
    return categoryConfig?.icon || Stethoscope;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Services Management</h1>
          <p className="text-gray-600">Manage medical services, procedures, and pricing</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Create a new medical service with pricing information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="service_name">Service Name</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="e.g., Cardiology Consultation"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Service description and details"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Service</Button>
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
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {serviceCategories.map((category) => (
            <Button
              key={category.value}
              variant={categoryFilter === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(category.value)}
              className="flex items-center gap-2"
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Services ({filteredServices.length})</CardTitle>
          <CardDescription>
            All available medical services and procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No services found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => {
                  const CategoryIcon = getCategoryIcon(service.service_name);
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{service.service_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {service.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {service.price.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {service.service_name.split(' ')[0]}
                        </Badge>
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
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
