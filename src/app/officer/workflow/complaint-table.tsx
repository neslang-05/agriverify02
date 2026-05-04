'use client';

import { useState } from 'react';
import { ProductComplaint, ComplaintStatus } from '@/types/complaints';
import { updateComplaintStatus } from '@/app/actions/complaints';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { Search, Filter, AlertCircle, MapPin, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ComplaintTableProps {
  initialComplaints: ProductComplaint[];
}

export function ComplaintTable({ initialComplaints }: ComplaintTableProps) {
  const [complaints, setComplaints] = useState<ProductComplaint[]>(initialComplaints);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredComplaints = complaints.filter((c) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      c.batch_number.toLowerCase().includes(searchLower) ||
      c.brand_name.toLowerCase().includes(searchLower) ||
      c.district.toLowerCase().includes(searchLower) ||
      c.issue_type.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (complaintId: string, newStatus: ComplaintStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(complaintId);
    
    const result = await updateComplaintStatus(complaintId, newStatus);
    
    if (result.success) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c))
      );
    } else {
      alert(result.error || 'Failed to update status');
    }
    
    setIsUpdating(null);
  };

  const getStatusStyles = (status: ComplaintStatus) => {
    switch (status) {
      case 'received':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'finished':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
          <Input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full md:w-44 h-11 bg-gray-50/50 border-gray-200 rounded-xl">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b border-gray-100">
                <TableHead className="py-4 px-6 font-semibold text-gray-700">Complaint Details</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-700">Location & Timing</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-700">Issue Analysis</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <TableRow key={complaint.id} className="group hover:bg-emerald-50/20 transition-colors border-b border-gray-50 last:border-0">
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900 tracking-tight">{complaint.batch_number}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Tag className="h-3 w-3" />
                          <span>{complaint.brand_name}</span>
                          <span className="text-gray-300">•</span>
                          <span>{complaint.crop_type}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {complaint.district}
                        </div>
                        <span className="text-xs text-gray-400">
                          {format(new Date(complaint.created_at), 'MMM dd, yyyy • HH:mm')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize bg-gray-50 border-gray-200 text-gray-600 font-medium py-1 px-2.5 rounded-lg">
                          {complaint.issue_type.replace(/_/g, ' ')}
                        </Badge>
                        {complaint.severity_score && (
                          <div className={`flex items-center justify-center h-7 w-7 rounded-full text-[10px] font-bold shadow-sm border ${
                            complaint.severity_score >= 4 
                              ? 'bg-red-50 text-red-600 border-red-100' 
                              : complaint.severity_score >= 3 
                              ? 'bg-orange-50 text-orange-600 border-orange-100' 
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {complaint.severity_score}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {isUpdating === complaint.id && (
                          <div className="animate-pulse flex items-center gap-2 text-xs text-emerald-600 font-medium">
                            <LoadingSpinner size="sm" />
                            <span>Updating...</span>
                          </div>
                        )}
                        <Select
                          disabled={!!isUpdating}
                          value={complaint.status}
                          onValueChange={(v) => handleStatusChange(complaint.id, v as ComplaintStatus)}
                        >
                          <SelectTrigger className={`w-40 h-10 text-sm font-semibold rounded-xl transition-all ${getStatusStyles(complaint.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                            <SelectItem value="received" className="rounded-lg mb-1">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-400" />
                                Received
                              </div>
                            </SelectItem>
                            <SelectItem value="under_review" className="rounded-lg mb-1">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-400" />
                                Under Review
                              </div>
                            </SelectItem>
                            <SelectItem value="finished" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                Finished
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">No complaints found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
