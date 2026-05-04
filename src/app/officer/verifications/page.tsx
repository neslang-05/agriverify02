'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Eye,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getAllVerificationsForOfficer, VerificationHistoryItem } from '@/app/actions/history';

export default function VerificationsPage() {
  const [records, setRecords] = useState<VerificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'genuine' | 'suspicious' | 'fake'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecords() {
      try {
        const result = await getAllVerificationsForOfficer();
        if (result.success && result.data) {
          setRecords(result.data);
        }
      } catch (error) {
        console.error('Failed to load verification records:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, []);

  const filteredRecords = records.filter((record) => {
    const matchesSearch = 
      (record.seed_variety?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (record.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (record.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'genuine':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none rounded-none px-2 py-1 flex items-center gap-1 w-fit">
            <CheckCircle2 className="h-3 w-3" />
            Genuine
          </Badge>
        );
      case 'suspicious':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none rounded-none px-2 py-1 flex items-center gap-1 w-fit">
            <AlertTriangle className="h-3 w-3" />
            Suspicious
          </Badge>
        );
      case 'fake':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none rounded-none px-2 py-1 flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" />
            Fake
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-neutral-500 animate-pulse">Retrieving all verification records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-800" />
            Verification Records
          </h1>
          <p className="text-neutral-500 mt-1">
            Browse and audit every seed verification performed across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-none border-neutral-300">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Filters Card */}
      <Card className="rounded-none shadow-sm border-neutral-200 overflow-hidden">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by variety, farmer name or email..."
              className="pl-10 rounded-none border-neutral-300 focus-visible:ring-emerald-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-none border-neutral-300 min-w-[140px] justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-neutral-500" />
                    <span>{statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-none">
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('genuine')}>Genuine Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('suspicious')}>Suspicious Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('fake')}>Fake Only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Main Records Table */}
      <Card className="rounded-none shadow-md border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50 hover:bg-neutral-50 border-b border-neutral-200">
                  <TableHead className="w-[100px] font-semibold text-neutral-900">Image</TableHead>
                  <TableHead className="font-semibold text-neutral-900">Date & Time</TableHead>
                  <TableHead className="font-semibold text-neutral-900">Farmer Details</TableHead>
                  <TableHead className="font-semibold text-neutral-900">Seed Variety</TableHead>
                  <TableHead className="font-semibold text-neutral-900">Status</TableHead>
                  <TableHead className="font-semibold text-neutral-900">Confidence</TableHead>
                  <TableHead className="text-right font-semibold text-neutral-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={record.id}
                        className="group hover:bg-neutral-50/50 border-b border-neutral-100 transition-colors"
                      >
                        <TableCell>
                          <div 
                            className="h-12 w-12 bg-neutral-100 flex items-center justify-center overflow-hidden cursor-zoom-in border border-neutral-200"
                            onClick={() => setSelectedImage(record.image_url)}
                          >
                            <img 
                              src={record.image_url} 
                              alt="Verification" 
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium text-neutral-900">
                              {format(new Date(record.created_at), 'MMM dd, yyyy')}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {format(new Date(record.created_at), 'hh:mm a')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.profiles ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-neutral-900 flex items-center gap-1">
                                <User className="h-3 w-3 text-neutral-400" />
                                {record.profiles.full_name}
                              </span>
                              <span className="text-xs text-neutral-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-neutral-400" />
                                {record.profiles.district}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-medium text-neutral-500 flex items-center gap-1 italic">
                                <User className="h-3 w-3 text-neutral-300" />
                                Guest User
                              </span>
                              <span className="text-xs text-neutral-400 italic">
                                Anonymous Verification
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-neutral-700 capitalize">
                            {record.seed_variety || 'Unknown Variety'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  record.confidence > 0.8 ? 'bg-emerald-500' : record.confidence > 0.5 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${record.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-neutral-600">
                              {Math.round(record.confidence * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none">
                              <DropdownMenuItem className="flex items-center gap-2" onClick={() => setSelectedImage(record.image_url)}>
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Download Image
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
                          <Search className="h-8 w-8 opacity-20" />
                          <p>No verification records found matching your filters.</p>
                          <Button 
                            variant="link" 
                            className="text-emerald-800"
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('all');
                            }}
                          >
                            Clear all filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Placeholder */}
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-sm text-neutral-500">
              Showing {filteredRecords.length} of {records.length} records
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="rounded-none px-2 h-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled className="rounded-none px-2 h-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white p-2 rounded-none shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 text-white hover:text-emerald-400"
                onClick={() => setSelectedImage(null)}
              >
                <XCircle className="h-8 w-8" />
              </Button>
              <div className="bg-neutral-100 flex items-center justify-center overflow-hidden min-h-[300px]">
                <img 
                  src={selectedImage} 
                  alt="Full verification image" 
                  className="max-h-[80vh] w-auto object-contain"
                />
              </div>
              <div className="p-4 flex items-center justify-between border-t border-neutral-100">
                <div className="flex items-center gap-4 text-sm font-medium text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Original Capture
                  </span>
                </div>
                <Button className="bg-emerald-800 hover:bg-emerald-900 rounded-none">
                  <Download className="h-4 w-4 mr-2" />
                  Download Original
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
