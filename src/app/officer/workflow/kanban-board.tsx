'use client';

import { useState } from 'react';
import { ProductComplaint, ComplaintStatus } from '@/types/complaints';
import { updateComplaintStatus } from '@/app/actions/complaints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';


interface KanbanBoardProps {
  initialComplaints: ProductComplaint[];
}

type Column = {
  id: ComplaintStatus;
  title: string;
  color: string;
  borderColor: string;
};

const COLUMNS: Column[] = [
  { id: 'received', title: 'Received', color: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { id: 'under_review', title: 'Under Review', color: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'finished', title: 'Finished', color: 'bg-green-50', borderColor: 'border-green-200' },
];

export function KanbanBoard({ initialComplaints }: KanbanBoardProps) {
  const [complaints, setComplaints] = useState<ProductComplaint[]>(initialComplaints);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ComplaintStatus) => {
    e.preventDefault();
    if (!draggedId) return;

    const complaint = complaints.find((c) => c.id === draggedId);
    if (!complaint || complaint.status === targetStatus) {
      setDraggedId(null);
      return;
    }

    // Optimistic update
    const previousComplaints = [...complaints];
    setComplaints((prev) =>
      prev.map((c) => (c.id === draggedId ? { ...c, status: targetStatus } : c))
    );
    setDraggedId(null);
    setIsUpdating(true);

    const result = await updateComplaintStatus(draggedId, targetStatus);
    
    setIsUpdating(false);

    if (!result.success) {
      // Revert on failure
      setComplaints(previousComplaints);
      alert(result.error || 'Failed to update complaint status');
    }
  };

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
          <LoadingSpinner text="Updating..." />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start h-full min-h-[600px]">
        {COLUMNS.map((col) => {
          const columnComplaints = complaints.filter((c) => c.status === col.id);

          return (
            <div
              key={col.id}
              className={`flex-1 w-full flex flex-col rounded-xl border ${col.borderColor} ${col.color} p-4`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{col.title}</h3>
                <Badge variant="secondary" className="bg-white">
                  {columnComplaints.length}
                </Badge>
              </div>

              <div className="flex flex-col gap-3 min-h-[200px]">
                {columnComplaints.map((complaint) => (
                  <Card
                    key={complaint.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, complaint.id)}
                    className="cursor-move rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white border-l-4 border-l-gray-400"
                  >
                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium text-gray-900 line-clamp-1">
                          {complaint.batch_number}
                        </CardTitle>
                        {complaint.severity_score && (
                          <span className="text-xs font-medium text-gray-500">
                            Severity: {complaint.severity_score}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <p className="text-xs text-gray-600 mb-2">{complaint.brand_name}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px] rounded-none py-0 px-1">
                          {complaint.issue_type.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] rounded-none py-0 px-1">
                          {complaint.district}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-gray-400 text-right">
                        {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                
                {columnComplaints.length === 0 && (
                  <div className="h-full flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-400">Drop here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
