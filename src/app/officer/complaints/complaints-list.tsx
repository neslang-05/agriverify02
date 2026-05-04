'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductComplaint, ComplaintStatus } from '@/types/complaints';

const statusColors: Record<ComplaintStatus, string> = {
  received: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  finished: 'bg-emerald-100 text-emerald-800',
};

export function ComplaintsList({ initialComplaints }: { initialComplaints: ProductComplaint[] }) {
  const [filter, setFilter] = useState<string>('all');

  const filtered =
    filter === 'all' ? initialComplaints : initialComplaints.filter((c) => c.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Individual Complaints</h2>
          <p className="text-gray-500 mt-1 text-sm">Detailed list of complaints across all batches</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="rounded-none w-40">
              <SelectValue placeholder="Filter by status" />
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

      <Card className="rounded-none shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Batch #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Crop</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Issue</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">District</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No complaints found
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      {c.batch_number}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{c.brand_name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.crop_type}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">
                      {c.issue_type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.district}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-none capitalize ${statusColors[c.status]}`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
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
