import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskLevelBadge } from '@/components/complaints/risk-level-badge';
import { ComplaintCard } from '@/components/complaints/complaint-card';
import { getBatchComplaints, getHighRiskBatches } from '@/app/actions/complaints';
import { ChevronLeft, AlertTriangle, MapPin } from 'lucide-react';

interface BatchDetailPageProps {
  params: {
    batchId: string;
  };
}

export async function generateMetadata({
  params,
}: BatchDetailPageProps): Promise<Metadata> {
  return {
    title: `Batch ${params.batchId} - Fake Seed Detection`,
    description: 'Review complaints for a specific seed batch',
  };
}

export default async function BatchDetailPage({ params }: BatchDetailPageProps) {
  const batchNumber = decodeURIComponent(params.batchId);
  const [complaints, allBatches] = await Promise.all([
    getBatchComplaints(batchNumber),
    getHighRiskBatches(),
  ]);

  const batchInfo = allBatches.find((b) => b.batch_number === batchNumber);

  // Group complaints by district
  const complaintsByDistrict = complaints.reduce(
    (acc: Record<string, any[]>, complaint) => {
      if (!acc[complaint.district]) {
        acc[complaint.district] = [];
      }
      acc[complaint.district].push(complaint);
      return acc;
    },
    {}
  );

  // Get issue type breakdown
  const issueTypeBreakdown = complaints.reduce(
    (acc: Record<string, number>, complaint) => {
      acc[complaint.issue_type] = (acc[complaint.issue_type] || 0) + 1;
      return acc;
    },
    {}
  );

  const issueTypeLabels: Record<string, string> = {
    poor_germination: 'Poor Germination',
    stunted_growth: 'Stunted Growth',
    no_yield: 'No Yield',
    pest_susceptibility: 'Pest Susceptibility',
    physical_impurity: 'Physical Impurity',
    other: 'Other',
  };

  const avgSeverity =
    complaints.length > 0
      ? (
          complaints.reduce((sum, c) => sum + (c.severity_score || 0), 0) /
          complaints.filter((c) => c.severity_score).length
        ).toFixed(1)
      : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/officer/complaints" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Batch: {batchNumber}</h1>
              {batchInfo && (
                <p className="text-gray-600 mt-2">{batchInfo.brand_name}</p>
              )}
            </div>
            {batchInfo && (
              <RiskLevelBadge level={batchInfo.risk_level} size="lg" />
            )}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600">{complaints.length}</div>
              <p className="text-sm text-gray-600 mt-1">Total Complaints</p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{Object.keys(complaintsByDistrict).length}</div>
              <p className="text-sm text-gray-600 mt-1">Districts Affected</p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600">{avgSeverity}</div>
              <p className="text-sm text-gray-600 mt-1">Avg. Severity</p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">
                {complaints.filter((c) => c.status === 'resolved').length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        {Object.keys(complaintsByDistrict).length > 0 && (
          <Card className="rounded-none shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Geographic Distribution</CardTitle>
              <CardDescription>Complaints by district</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(complaintsByDistrict).map(([district, districtComplaints]) => (
                  <div key={district} className="border border-gray-200 rounded-none p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{district}</h4>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {districtComplaints.length}
                    </div>
                    <p className="text-xs text-gray-600">
                      {districtComplaints.filter((c) => c.status === 'resolved').length} resolved
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issue Type Breakdown */}
        {Object.keys(issueTypeBreakdown).length > 0 && (
          <Card className="rounded-none shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Issue Type Analysis</CardTitle>
              <CardDescription>Breakdown of reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(issueTypeBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([issueType, count]) => {
                    const percentage = Math.round((count / complaints.length) * 100);
                    return (
                      <div key={issueType} className="flex items-center gap-4">
                        <div className="flex-1 min-w-[150px]">
                          <p className="text-sm font-medium text-gray-700">
                            {issueTypeLabels[issueType]}
                          </p>
                        </div>
                        <div className="w-32">
                          <div className="w-full bg-gray-200 rounded-none h-2 overflow-hidden">
                            <div
                              className="bg-red-500 h-full rounded-none transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right min-w-[60px]">
                          <Badge className="rounded-none bg-gray-100 text-gray-700 hover:bg-gray-100">
                            {count} ({percentage}%)
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="rounded-none shadow-md mb-8 border-l-4 border-l-orange-600 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg text-orange-900">Management Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-none bg-orange-600 hover:bg-orange-700">
                Flag for Lab Testing
              </Button>
              <Button className="rounded-none bg-red-600 hover:bg-red-700">
                Suspend Batch
              </Button>
              <Button variant="outline" className="rounded-none">
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Individual Complaints ({complaints.length})
          </h2>
          
          {complaints.length === 0 ? (
            <Card className="rounded-none">
              <CardContent className="pt-12 pb-12 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No complaints recorded for this batch</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
