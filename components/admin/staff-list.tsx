'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Building2,
  Briefcase,
  Clock,
} from 'lucide-react';
import { useFacility } from '@/lib/facility-context';
import { AddStaffDialog } from './add-staff-dialog';
import { toast } from 'sonner';
import Link from 'next/link';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  license_number?: string;
  employment_type: string;
  facility_status: string;
  start_date: string;
  department_ref?: {
    id: string;
    name: string;
    code: string;
  };
}

export function StaffList() {
  const facility = useFacility();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const brandColor = facility?.branding?.primaryColor || facility?.primary_color || '#3b82f6';

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/staff?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setStaff(data.staff);
      } else {
        toast.error('Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [roleFilter, statusFilter, searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this facility? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Staff member removed successfully');
        fetchStaff();
      } else {
        toast.error(data.error || 'Failed to remove staff member');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to remove staff member');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      ON_LEAVE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || styles.INACTIVE}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      NURSE: 'bg-blue-100 text-blue-800 border-blue-200',
      LAB_TECHNICIAN: 'bg-purple-100 text-purple-800 border-purple-200',
      CASHIER: 'bg-orange-100 text-orange-800 border-orange-200',
      ADMIN_ASSISTANT: 'bg-pink-100 text-pink-800 border-pink-200',
    };

    const labels = {
      NURSE: 'Nurse',
      LAB_TECHNICIAN: 'Lab Technician',
      CASHIER: 'Cashier',
      ADMIN_ASSISTANT: 'Admin Assistant',
    };

    return (
      <Badge className={styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800'}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1">
            Manage staff members at {facility?.name || 'your facility'}
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          style={{ backgroundColor: brandColor, color: 'white' }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="NURSE">Nurse</SelectItem>
                <SelectItem value="LAB_TECHNICIAN">Lab Technician</SelectItem>
                <SelectItem value="CASHIER">Cashier</SelectItem>
                <SelectItem value="ADMIN_ASSISTANT">Admin Assistant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: brandColor }}></div>
          <p className="text-gray-600 mt-4">Loading staff members...</p>
        </div>
      ) : staff.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first staff member'}
              </p>
              {!searchQuery && roleFilter === 'all' && statusFilter === 'all' && (
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  style={{ backgroundColor: brandColor, color: 'white' }}
                  className="hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Staff Member
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {staff.map((member) => (
            <Card
              key={member.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ borderLeft: `4px solid ${brandColor}` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: brandColor }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                        {getRoleBadge(member.role)}
                        {getStatusBadge(member.facility_status)}
                      </div>
                      {member.license_number && (
                        <p className="text-sm text-gray-600 mb-1">
                          License: <span className="font-mono">{member.license_number}</span>
                        </p>
                      )}
                      {member.department_ref && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Building2 className="h-3 w-3" />
                          <span>{member.department_ref.name} ({member.department_ref.code})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/staff/${member.id}`}>
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info('Edit functionality coming soon')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id, member.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{member.address}</span>
                  </div>
                </div>

                {/* Employment Info */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {member.employment_type.replace('_', '-')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Started: {new Date(member.start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Staff Dialog */}
      <AddStaffDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchStaff}
      />
    </div>
  );
}




