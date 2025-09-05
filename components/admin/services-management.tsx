"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Package, 
  FileText, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react";
import Link from "next/link";

interface Service {
  id: string;
  service_name: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
}

interface ServiceBundle {
  id: string;
  bundle_name: string;
  description: string;
  total_price: number;
  services_count: number;
  created_at: string;
}

interface ServiceTemplate {
  id: string;
  template_name: string;
  description: string;
  department: string;
  services_count: number;
  created_at: string;
}

interface ServiceAnalytics {
  totalServices: number;
  totalBundles: number;
  totalTemplates: number;
  totalRevenue: number;
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export function ServicesManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [services, setServices] = useState<Service[]>([]);
  const [bundles, setBundles] = useState<ServiceBundle[]>([]);
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [analytics, setAnalytics] = useState<ServiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServicesData();
  }, []);

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      
      // Fetch all services data in parallel
      const [servicesRes, bundlesRes, templatesRes, analyticsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/service-bundles'),
        fetch('/api/service-templates'),
        fetch('/api/services/analytics')
      ]);

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.allServices || []);
      }

      if (bundlesRes.ok) {
        const bundlesData = await bundlesRes.json();
        setBundles(bundlesData.bundles || []);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics({
          totalServices: analyticsData.totalServices || 0,
          totalBundles: analyticsData.totalBundles || 0,
          totalTemplates: analyticsData.totalTemplates || 0,
          totalRevenue: analyticsData.totalRevenue || 0,
          topServices: analyticsData.topServices || [],
          monthlyRevenue: analyticsData.monthlyRevenue || []
        });
      }
    } catch (error) {
      console.error('Error fetching services data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Cardiology': 'bg-red-100 text-red-800',
      'Neurology': 'bg-purple-100 text-purple-800',
      'Orthopedics': 'bg-blue-100 text-blue-800',
      'Dermatology': 'bg-green-100 text-green-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading services data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services & Procedures</h1>
          <p className="text-gray-600 mt-1">
            Manage medical services, bundles, templates, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/services/create">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {(analytics || loading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalServices || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active medical services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Bundles</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalBundles || 0}</div>
              <p className="text-xs text-muted-foreground">
                Pre-configured packages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalTemplates || 0}</div>
              <p className="text-xs text-muted-foreground">
                Service protocols
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(analytics?.totalRevenue || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From all services
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common service management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/admin/services/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Service
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/service-bundles/create">
                    <Package className="w-4 h-4 mr-2" />
                    Create Service Bundle
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/service-templates/create">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Service Template
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/service-analytics">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Services</CardTitle>
                <CardDescription>
                  Latest added services and procedures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{service.service_name}</p>
                        <p className="text-sm text-gray-600">${service.price}</p>
                      </div>
                      <Badge className={getCategoryColor(service.category)}>
                        {service.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medical Services</CardTitle>
                  <CardDescription>
                    Manage individual medical services and procedures
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/services/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium">{service.service_name}</h3>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getCategoryColor(service.category)}>
                        {service.category}
                      </Badge>
                      <span className="font-medium">${service.price}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/services/${service.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/services/${service.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bundles Tab */}
        <TabsContent value="bundles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Bundles</CardTitle>
                  <CardDescription>
                    Pre-configured service packages and bundles
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/service-bundles/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Bundle
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bundles.map((bundle) => (
                  <div key={bundle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-green-600" />
                        <div>
                          <h3 className="font-medium">{bundle.bundle_name}</h3>
                          <p className="text-sm text-gray-600">{bundle.description}</p>
                          <p className="text-xs text-gray-500">{bundle.services_count} services included</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">${bundle.total_price}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/service-bundles/${bundle.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/service-bundles/${bundle.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Templates</CardTitle>
                  <CardDescription>
                    Standardized service protocols and workflows
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/service-templates/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <div>
                          <h3 className="font-medium">{template.template_name}</h3>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <p className="text-xs text-gray-500">{template.department} • {template.services_count} services</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{template.department}</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/service-templates/${template.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/service-templates/${template.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}