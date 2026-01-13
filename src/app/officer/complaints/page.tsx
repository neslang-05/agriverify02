import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskLevelBadge } from '@/components/complaints/risk-level-badge';
import { getHighRiskBatches, getComplaintStats } from '@/app/actions/complaints';
import { AlertTriangle, TrendingUp, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Complaint Dashboard - Fake Seed Detection',
  description: 'Monitor and manage seed quality complaints from farmers',
};

export default async function ComplaintsPage() {
  const [batches, stats] = await Promise.all([getHighRiskBatches(), getComplaintStats()]);

  // Separate by risk level
  const highRiskBatches = batches.filter((b) => b.risk_level === 'high_risk');
  const suspiciousBatches = batches.filter((b) => b.risk_level === 'suspicious');
  const normalBatches = batches.filter((b) => b.risk_level === 'normal');

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complaint Governance Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage seed quality complaints from the field</p>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* High Risk Batches */}
          <Card className="rounded-none border-l-4 border-l-red-600 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">High Risk Batches</CardTitle>
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">{stats.highRiskBatchesCount}</div>
              <p className="text-sm text-gray-600 mt-2">
                Batches with more than 5 complaints
              </p>
            </CardContent>
          </Card>

          {/* Today's Complaints */}
          <Card className="rounded-none border-l-4 border-l-orange-600 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Today's Complaints</CardTitle>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{stats.todayComplaintsCount}</div>
              <p className="text-sm text-gray-600 mt-2">New reports received today</p>
            </CardContent>
          </Card>

          {/* Worst District */}
          <Card className="rounded-none border-l-4 border-l-yellow-600 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Critical District</CardTitle>
                <MapPin className="w-5 h-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.worstPerformingDistrict}</div>
              <p className="text-sm text-gray-600 mt-2">
                Most complaint reports
              </p>
            </CardContent>
          </Card>
        </div>

        {/* High Risk Batches Table */}
        {highRiskBatches.length > 0 && (
          <Card className="rounded-none shadow-md mb-8 border-l-4 border-l-red-600">
            <CardHeader>
              <CardTitle className="text-lg text-red-700">Critical: High Risk Batches</CardTitle>
              <CardDescription>Immediate action required</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch #</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Brand</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Complaints</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Districts Affected</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Risk Level</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highRiskBatches.map((batch) => (
                      <tr key={batch.batch_number} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-gray-900">{batch.batch_number}</td>
                        <td className="py-3 px-4 text-gray-700">{batch.brand_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="rounded-none bg-red-100 text-red-700 hover:bg-red-100">
                            {batch.total_complaints}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="rounded-none bg-gray-100 text-gray-700 hover:bg-gray-100">
                            {batch.unique_districts}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <RiskLevelBadge level={batch.risk_level} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/officer/complaints/${encodeURIComponent(batch.batch_number)}`}>
                            <Button size="sm" variant="outline" className="rounded-none">
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suspicious Batches */}
        {suspiciousBatches.length > 0 && (
          <Card className="rounded-none shadow-md mb-8 border-l-4 border-l-orange-600">
            <CardHeader>
              <CardTitle className="text-lg text-orange-700">Warning: Suspicious Batches</CardTitle>
              <CardDescription>3-5 complaints or complaints from multiple districts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch #</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Brand</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Complaints</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Districts Affected</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Risk Level</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspiciousBatches.map((batch) => (
                      <tr key={batch.batch_number} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-gray-900">{batch.batch_number}</td>
                        <td className="py-3 px-4 text-gray-700">{batch.brand_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="rounded-none bg-orange-100 text-orange-700 hover:bg-orange-100">
                            {batch.total_complaints}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="rounded-none bg-gray-100 text-gray-700 hover:bg-gray-100">
                            {batch.unique_districts}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <RiskLevelBadge level={batch.risk_level} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/officer/complaints/${encodeURIComponent(batch.batch_number)}`}>
                            <Button size="sm" variant="outline" className="rounded-none">
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Normal Batches */}
        {normalBatches.length > 0 && (
          <Card className="rounded-none shadow-md border-l-4 border-l-green-600">
            <CardHeader>
              <CardTitle className="text-lg text-green-700">Normal: Compliant Batches</CardTitle>
              <CardDescription>Less than 3 complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch #</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Brand</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Complaints</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Districts Affected</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalBatches.map((batch) => (
                      <tr key={batch.batch_number} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-gray-900">{batch.batch_number}</td>
                        <td className="py-3 px-4 text-gray-700">{batch.brand_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="rounded-none bg-green-100 text-green-700 hover:bg-green-100">
                            {batch.total_complaints}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="rounded-none bg-gray-100 text-gray-700 hover:bg-gray-100">
                            {batch.unique_districts}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <RiskLevelBadge level={batch.risk_level} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {batches.length === 0 && (
          <Card className="rounded-none">
            <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No complaints reported</h3>
              <p className="text-gray-600">
                Complaints from farmers will appear here once they are submitted.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
