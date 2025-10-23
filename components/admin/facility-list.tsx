'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Eye,
  PauseCircle,
  PlayCircle,
  Trash2,
  BarChart3,
  ExternalLink,
  Users,
  Calendar,
  MapPin,
  Globe,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Facility {
  id: string;
  name: string;
  slug: string;
  legal_name: string;
  facility_code: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  primary_color: string;
  secondary_color: string;
  status: string;
  is_verified: boolean;
  created_at: Date;
  _count: {
    doctor_facilities: number;
    patient_facilities: number;
    appointments: number;
  };
}

interface FacilityListProps {
  facilities: Facility[];
}

export function FacilityList({ facilities }: FacilityListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  // Filter and search facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
      const matchesSearch = 
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.facility_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || 
        facility.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [facilities, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Facilities</CardTitle>
              <CardDescription>
                {filteredFacilities.length} of {facilities.length} facilities
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search facilities by name, code, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <Card 
              key={facility.id}
              className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/super-admin/facilities/${facility.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                    style={{ backgroundColor: facility.primary_color }}
                  >
                    {facility.name.charAt(0)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/super-admin/facilities/${facility.id}`);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/super-admin/facilities/${facility.id}/edit`);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        window.open(`http://${facility.slug}.localhost:3000`, '_blank');
                      }}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Portal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/super-admin/facilities/${facility.id}/analytics`);
                      }}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </DropdownMenuItem>
                      {facility.status === 'ACTIVE' ? (
                        <DropdownMenuItem className="text-orange-600">
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-4">
                  <CardTitle className="text-lg mb-1">{facility.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <Globe className="h-3 w-3" />
                    {facility.slug}.ihosi.com
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Status */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(facility.status)}
                  {facility.is_verified && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {facility.city}, {facility.state}
                </div>

                {/* Contact */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="h-3 w-3" />
                    {facility.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="h-3 w-3" />
                    {facility.phone}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {facility._count.doctor_facilities}
                    </div>
                    <div className="text-xs text-gray-500">Doctors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {facility._count.patient_facilities}
                    </div>
                    <div className="text-xs text-gray-500">Patients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {facility._count.appointments}
                    </div>
                    <div className="text-xs text-gray-500">Appts</div>
                  </div>
                </div>

                {/* Branding Preview */}
                <div className="flex gap-2 pt-2 border-t">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: facility.primary_color }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: facility.secondary_color }}
                    title="Secondary Color"
                  />
                </div>

                {/* Code */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Code: <span className="font-mono font-medium">{facility.facility_code}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subdomain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFacilities.map((facility) => (
                    <tr 
                      key={facility.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/super-admin/facilities/${facility.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                            style={{ backgroundColor: facility.primary_color }}
                          >
                            {facility.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{facility.name}</div>
                            <div className="text-sm text-gray-500">{facility.facility_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {facility.city}, {facility.state}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Globe className="h-4 w-4" />
                          {facility.slug}.ihosi.com
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-600">
                            <Users className="h-4 w-4 inline mr-1" />
                            {facility._count.doctor_facilities} docs
                          </span>
                          <span className="text-gray-600">
                            {facility._count.patient_facilities} pts
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(facility.status)}
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/super-admin/facilities/${facility.id}`);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/super-admin/facilities/${facility.id}/edit`);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              window.open(`http://${facility.slug}.localhost:3000`, '_blank');
                            }}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Portal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/super-admin/facilities/${facility.id}/analytics`);
                            }}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            {facility.status === 'ACTIVE' ? (
                              <DropdownMenuItem className="text-orange-600">
                                <PauseCircle className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first facility'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => router.push('/super-admin?create=true')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Facility
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

