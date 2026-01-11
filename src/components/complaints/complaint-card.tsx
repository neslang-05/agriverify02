import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductComplaint, ComplaintStatus } from '@/types/complaints';
import { MessageSquareWarning, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ComplaintCardProps {
  complaint: ProductComplaint;
  onAction?: (complaintId: string) => void;
}

export function ComplaintCard({ complaint, onAction }: ComplaintCardProps) {
  const statusStyles: Record<ComplaintStatus, { icon: any; color: string; bgColor: string }> = {
    open: {
      icon: MessageSquareWarning,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    investigating: {
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    resolved: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  };

  const issueTypeLabels: Record<string, string> = {
    poor_germination: 'Poor Germination',
    stunted_growth: 'Stunted Growth',
    no_yield: 'No Yield',
    pest_susceptibility: 'Pest Susceptibility',
    physical_impurity: 'Physical Impurity',
    other: 'Other',
  };

  const StatusIcon = statusStyles[complaint.status].icon;

  return (
    <Card className="rounded-none border-l-4 border-l-gray-400 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Batch: {complaint.batch_number}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {complaint.brand_name} • {complaint.crop_type}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-none ${statusStyles[complaint.status].bgColor}`}>
              <StatusIcon className={`w-5 h-5 ${statusStyles[complaint.status].color}`} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="rounded-none bg-gray-100 text-gray-700 hover:bg-gray-100">
            {issueTypeLabels[complaint.issue_type]}
          </Badge>
          {complaint.severity_score && (
            <span className="text-sm font-medium text-gray-600">
              Severity: {complaint.severity_score}/5
            </span>
          )}
        </div>

        {complaint.description && (
          <p className="text-sm text-gray-700 line-clamp-2">{complaint.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">District:</span> {complaint.district}
          </div>
          {complaint.days_since_sowing && (
            <div>
              <span className="font-medium">Days Since Sowing:</span> {complaint.days_since_sowing}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Reported {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
        </div>

        <div>
          <Badge
            variant="outline"
            className="rounded-none border-gray-400 text-gray-700 capitalize"
          >
            {complaint.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
