'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllComplaints } from '@/app/actions/complaints';
import { ProductComplaint, ComplaintStatus } from '@/types/complaints';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const statusColors: Record<ComplaintStatus, string> = {
  open: 'bg-amber-100 text-amber-800',
  investigating: 'bg-blue-100 text-blue-800',
  resolved: 'bg-emerald-100 text-emerald-800',
};

export default function AllComplaintsPage() {
  const [complaints, setComplaints] = useState<ProductComplaint[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllComplaints()
      .then((data) => {
        setComplaints(data);
      })
      .catch((err) => {
        console.error('Failed to load complaints:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered =
    filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading complaints..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">All Complaints</h1>
          <p className="text-neutral-500 mt-1">Individual farmer complaints across all batches</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="rounded-none w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <Card className="rounded-none border border-neutral-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Batch #</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Brand</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Crop</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Issue</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">District</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                      No complaints found
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-800">
                      {c.batch_number}
                    </td>
                    <td className="px-4 py-3 text-neutral-800">{c.brand_name}</td>
                    <td className="px-4 py-3 text-neutral-600">{c.crop_type}</td>
                    <td className="px-4 py-3 text-neutral-600 capitalize">
                      {c.issue_type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{c.district}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${statusColors[c.status]}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-xs whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
