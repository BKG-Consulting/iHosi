'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  UserCog,
  Bed,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useFacility } from '@/lib/facility-context';
import { CreateDepartmentDialog } from './create-department-dialog';
import { toast } from 'sonner';
import Link from 'next/link';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  contact_number?: string;
  email?: string;
  status: string;
  capacity: number;
  current_load: number;
  _count: {
    doctors: number;
    staff: number;
    wards: number;
  };
}

export function DepartmentList() {
  const facility = useFacility();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const brandColor = facility?.branding?.primaryColor || facility?.primary_color || '#3b82f6';

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/departments?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setDepartments(data.departments);
      } else {
        toast.error('Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [statusFilter, searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/departments/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Department deleted successfully');
        fetchDepartments();
      } else {
        toast.error(data.error || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CLOSED: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || styles.INACTIVE}>
        {status}
      </Badge>
    );
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return '#ef4444'; // Red
    if (percentage >= 75) return '#f59e0b'; // Orange
    return brandColor; // Brand color
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-600 mt-1">
            Manage departments for {facility?.name || 'your facility'}
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          style={{ backgroundColor: brandColor, color: 'white' }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search departments by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Department List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: brandColor }}></div>
          <p className="text-gray-600 mt-4">Loading departments...</p>
        </div>
      ) : departments.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first department'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  style={{ backgroundColor: brandColor, color: 'white' }}
                  className="hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Department
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {departments.map((dept) => (
            <Card
              key={dept.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ borderLeft: `4px solid ${brandColor}` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: brandColor }}
                    >
                      {dept.code.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{dept.name}</h3>
                        {getStatusBadge(dept.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {dept.code}
                        </span>
                        {dept.location && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{dept.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/departments/${dept.id}`}>
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Open edit dialog
                        toast.info('Edit functionality coming soon');
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(dept.id, dept.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {dept.description && (
                  <p className="text-gray-600 mb-4">{dept.description}</p>
                )}

                {/* Contact Info */}
                {(dept.contact_number || dept.email) && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {dept.contact_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{dept.contact_number}</span>
                      </div>
                    )}
                    {dept.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{dept.email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4" style={{ color: brandColor }} />
                      <p className="text-sm text-gray-600">Patients</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: brandColor }}>
                      {dept.current_load}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <UserCog className="h-4 w-4 text-purple-600" />
                      <p className="text-sm text-gray-600">Doctors</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {dept._count.doctors}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-gray-600">Staff</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {dept._count.staff}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Bed className="h-4 w-4 text-orange-600" />
                      <p className="text-sm text-gray-600">Wards</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {dept._count.wards}
                    </p>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-medium">
                      {dept.current_load} / {dept.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((dept.current_load / dept.capacity) * 100, 100)}%`,
                        backgroundColor: getCapacityColor(dept.current_load, dept.capacity),
                      }}
                    />
                  </div>
                  {dept.current_load / dept.capacity >= 0.9 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Near capacity - consider expansion</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Department Dialog */}
      <CreateDepartmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchDepartments}
      />
    </div>
  );
}




