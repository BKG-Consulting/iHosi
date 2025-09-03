"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Building2, 
  Plus, 
  Database, 
  Cloud, 
  Server, 
  Settings,
  Users,
  Shield,
  Download,
  Palette
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  type: 'SAAS' | 'ON_PREMISE' | 'PRIVATE_DB';
  databaseUrl?: string;
  features: string[];
  settings: {
    allowDataExport: boolean;
    allowCustomBranding: boolean;
    maxUsers: number;
    dataRetentionDays: number;
  };
}

export const TenantManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    type: 'SAAS' as const,
    databaseUrl: '',
    features: ['basic'],
    settings: {
      allowDataExport: false,
      allowCustomBranding: false,
      maxUsers: 100,
      dataRetentionDays: 2555
    }
  });

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants');
      const data = await response.json();
      
      if (data.success) {
        setTenants(data.tenants);
      } else {
        toast.error('Failed to fetch tenants');
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async () => {
    try {
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTenant),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Tenant created successfully');
        setIsCreateDialogOpen(false);
        setNewTenant({
          name: '',
          type: 'SAAS',
          databaseUrl: '',
          features: ['basic'],
          settings: {
            allowDataExport: false,
            allowCustomBranding: false,
            maxUsers: 100,
            dataRetentionDays: 2555
          }
        });
        fetchTenants();
      } else {
        toast.error(data.message || 'Failed to create tenant');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast.error('Failed to create tenant');
    }
  };

  const getTenantTypeIcon = (type: string) => {
    switch (type) {
      case 'SAAS':
        return <Cloud className="w-5 h-5 text-blue-500" />;
      case 'ON_PREMISE':
        return <Server className="w-5 h-5 text-green-500" />;
      case 'PRIVATE_DB':
        return <Database className="w-5 h-5 text-purple-500" />;
      default:
        return <Building2 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTenantTypeColor = (type: string) => {
    switch (type) {
      case 'SAAS':
        return 'bg-blue-100 text-blue-800';
      case 'ON_PREMISE':
        return 'bg-green-100 text-green-800';
      case 'PRIVATE_DB':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenant Management</h2>
          <p className="text-gray-600">Manage hospital deployments and database configurations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Set up a new hospital tenant with their preferred deployment type
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Hospital Name *</Label>
                <Input
                  id="name"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  placeholder="Enter hospital name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Deployment Type *</Label>
                <Select
                  value={newTenant.type}
                  onValueChange={(value: any) => setNewTenant({ ...newTenant, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAAS">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4" />
                        SaaS (Shared Database)
                      </div>
                    </SelectItem>
                    <SelectItem value="ON_PREMISE">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        On-Premise (Hospital's Server)
                      </div>
                    </SelectItem>
                    <SelectItem value="PRIVATE_DB">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Private Database (Hospital's Cloud)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newTenant.type !== 'SAAS' && (
                <div>
                  <Label htmlFor="databaseUrl">Database URL *</Label>
                  <Input
                    id="databaseUrl"
                    value={newTenant.databaseUrl}
                    onChange={(e) => setNewTenant({ ...newTenant, databaseUrl: e.target.value })}
                    placeholder="postgresql://user:password@host:port/database"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={newTenant.settings.maxUsers}
                    onChange={(e) => setNewTenant({
                      ...newTenant,
                      settings: { ...newTenant.settings, maxUsers: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="dataRetention">Data Retention (Days)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={newTenant.settings.dataRetentionDays}
                    onChange={(e) => setNewTenant({
                      ...newTenant,
                      settings: { ...newTenant.settings, dataRetentionDays: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <Label htmlFor="allowDataExport">Allow Data Export</Label>
                  </div>
                  <Switch
                    id="allowDataExport"
                    checked={newTenant.settings.allowDataExport}
                    onCheckedChange={(checked) => setNewTenant({
                      ...newTenant,
                      settings: { ...newTenant.settings, allowDataExport: checked }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <Label htmlFor="allowCustomBranding">Allow Custom Branding</Label>
                  </div>
                  <Switch
                    id="allowCustomBranding"
                    checked={newTenant.settings.allowCustomBranding}
                    onCheckedChange={(checked) => setNewTenant({
                      ...newTenant,
                      settings: { ...newTenant.settings, allowCustomBranding: checked }
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTenant}>
                  Create Tenant
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTenantTypeIcon(tenant.type)}
                  <CardTitle className="text-lg">{tenant.name}</CardTitle>
                </div>
                <Badge className={getTenantTypeColor(tenant.type)}>
                  {tenant.type}
                </Badge>
              </div>
              <CardDescription>
                {tenant.type === 'SAAS' && 'Shared database with tenant isolation'}
                {tenant.type === 'ON_PREMISE' && 'Hospital manages their own server'}
                {tenant.type === 'PRIVATE_DB' && 'Hospital manages their own database'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Max Users
                  </span>
                  <span className="font-medium">{tenant.settings.maxUsers}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Data Retention
                  </span>
                  <span className="font-medium">{tenant.settings.dataRetentionDays} days</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Data Export
                  </span>
                  <Badge variant={tenant.settings.allowDataExport ? "default" : "secondary"}>
                    {tenant.settings.allowDataExport ? "Allowed" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Palette className="w-4 h-4" />
                    Custom Branding
                  </span>
                  <Badge variant={tenant.settings.allowCustomBranding ? "default" : "secondary"}>
                    {tenant.settings.allowCustomBranding ? "Allowed" : "Disabled"}
                  </Badge>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tenants.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants configured</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first hospital tenant.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
