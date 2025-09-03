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
  Plus, Search, Package, Edit, Trash2, Eye, DollarSign, Clock, Users
} from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: number;
  service_name: string;
  price: number;
  duration_minutes?: number;
  category?: string;
}

interface ServiceBundleItem {
  id: string;
  service_id: number;
  quantity: number;
  is_required: boolean;
  service: Service;
}

interface ServiceBundle {
  id: string;
  name: string;
  description?: string;
  total_price: number;
  discount_percent?: number;
  is_active: boolean;
  bundle_items: ServiceBundleItem[];
  created_at: string;
  updated_at: string;
}

export const ServiceBundlesManagement = () => {
  const [bundles, setBundles] = useState<ServiceBundle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<ServiceBundle | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_percent: ""
  });

  const [selectedServices, setSelectedServices] = useState<Array<{
    service_id: number;
    quantity: number;
    is_required: boolean;
  }>>([]);

  useEffect(() => {
    fetchBundles();
    fetchServices();
  }, []);

  const fetchBundles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/service-bundles?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBundles(data.bundles || []);
        }
      }
    } catch (error) {
      console.error('Error fetching service bundles:', error);
      toast.error('Failed to load service bundles');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || selectedServices.length === 0) {
      toast.error('Please provide bundle name and select at least one service');
      return;
    }

    try {
      const response = await fetch('/api/service-bundles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          services: selectedServices,
          discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Service bundle created successfully');
          setIsAddDialogOpen(false);
          setFormData({ name: "", description: "", discount_percent: "" });
          setSelectedServices([]);
          fetchBundles();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create service bundle');
      }
    } catch (error) {
      console.error('Error creating service bundle:', error);
      toast.error('Failed to create service bundle');
    }
  };

  const handleDelete = async (bundleId: string) => {
    if (!confirm('Are you sure you want to delete this service bundle?')) return;

    try {
      const response = await fetch(`/api/service-bundles/${bundleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Service bundle deleted successfully');
          fetchBundles();
        } else {
          toast.error(data.message || 'Failed to delete service bundle');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete service bundle');
      }
    } catch (error) {
      console.error('Error deleting service bundle:', error);
      toast.error('Failed to delete service bundle');
    }
  };

  const addServiceToBundle = (serviceId: number) => {
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
        is_required: true
      }]);
    }
  };

  const removeServiceFromBundle = (serviceId: number) => {
    setSelectedServices(prev => prev.filter(s => s.service_id !== serviceId));
  };

  const updateServiceQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeServiceFromBundle(serviceId);
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

  const filteredBundles = bundles.filter(bundle => 
    bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bundle.description && bundle.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateBundleSavings = (bundle: ServiceBundle) => {
    const individualTotal = bundle.bundle_items.reduce((sum, item) => 
      sum + (item.service.price * item.quantity), 0
    );
    return individualTotal - bundle.total_price;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Bundles Management</h1>
          <p className="text-gray-600">Create and manage service packages and bundles</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Service Bundle</DialogTitle>
              <DialogDescription>
                Create a package of services with optional discounts
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bundle_name">Bundle Name</Label>
                  <Input
                    id="bundle_name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Complete Health Checkup"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount % (Optional)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bundle_description">Description</Label>
                <Textarea
                  id="bundle_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Bundle description and details"
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
                        onClick={() => addServiceToBundle(service.id)}
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
                  <Label>Selected Services</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {selectedServices.map((item) => {
                      const service = services.find(s => s.id === item.service_id);
                      if (!service) return null;
                      
                      return (
                        <div key={item.service_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{service.service_name}</span>
                            <span className="text-sm text-gray-500 ml-2">${service.price}</span>
                          </div>
                          <div className="flex items-center gap-2">
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
                              onClick={() => removeServiceFromBundle(item.service_id)}
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
                <Button type="submit">Create Bundle</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search service bundles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bundles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Bundles ({filteredBundles.length})</CardTitle>
          <CardDescription>
            All available service packages and bundles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bundles...</p>
            </div>
          ) : filteredBundles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No service bundles found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bundle</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBundles.map((bundle) => {
                  const savings = calculateBundleSavings(bundle);
                  return (
                    <TableRow key={bundle.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bundle.name}</div>
                          {bundle.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {bundle.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>{bundle.bundle_items.length} services</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {bundle.total_price.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {savings > 0 && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Save ${savings.toFixed(2)}
                          </Badge>
                        )}
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
                            onClick={() => handleDelete(bundle.id)}
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
