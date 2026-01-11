'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Filter,
  Download,
  MapPin,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DistrictHeatmap } from '@/components/officer/district-heatmap';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getAnalytics } from '@/app/actions/analytics';
import { AnalyticsData, DISTRICTS } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const district = selectedDistrict === 'all' ? undefined : selectedDistrict;
        const data = await getAnalytics(district);
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [selectedDistrict]);

  const handleExport = () => {
    if (!analytics) return;

    const csvContent = [
      ['District', 'Total', 'Genuine', 'Suspicious', 'Fake', 'Risk Level'],
      ...analytics.districtData.map((d) => [
        d.district,
        d.total,
        d.genuine,
        d.suspicious,
        d.fake,
        d.risk_level,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Failed to load analytics data</p>
      </div>
    );
  }

  const highRiskDistricts = analytics.districtData.filter(
    (d) => d.risk_level === 'high'
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Deep Analytics</h1>
          <p className="text-neutral-500 mt-1">
            Detailed verification analytics and district-wise insights.
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="rounded-none border-2 border-emerald-800 text-emerald-800 hover:bg-emerald-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="rounded-none shadow-md border-none">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-800" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>District</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="rounded-none border-2 focus:border-emerald-800 focus:ring-0">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none max-h-48">
                    <SelectItem value="all" className="rounded-none">
                      All Districts
                    </SelectItem>
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d} className="rounded-none">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* District Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="rounded-none shadow-md border-none">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-800" />
              District-wise Verification Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DistrictHeatmap data={analytics.districtData} />
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-green-100 border border-green-200" />
                <span className="text-sm text-neutral-600">Low Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-yellow-100 border border-yellow-200" />
                <span className="text-sm text-neutral-600">Medium Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-red-100 border border-red-200" />
                <span className="text-sm text-neutral-600">High Risk</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="rounded-none shadow-md border-none">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-800" />
                Monthly Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.dailyTrend.slice(-14)}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                      fontSize={10}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <Legend />
                    <Bar dataKey="genuine" fill="#16a34a" name="Genuine" />
                    <Bar dataKey="suspicious" fill="#ca8a04" name="Suspicious" />
                    <Bar dataKey="fake" fill="#dc2626" name="Fake" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* High Risk Districts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="rounded-none shadow-md border-none">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                High Risk Districts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {highRiskDistricts.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">
                  No high-risk districts identified
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                      <TableHead className="font-semibold">District</TableHead>
                      <TableHead className="font-semibold text-right">
                        Fake Count
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Fake %
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highRiskDistricts.map((district) => (
                      <TableRow key={district.district} className="hover:bg-neutral-50">
                        <TableCell className="font-medium">
                          {district.district}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-sm font-medium">
                            {district.fake}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-neutral-500">
                          {((district.fake / district.total) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed District Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="rounded-none shadow-md border-none">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <CardTitle className="text-lg font-semibold text-neutral-900">
              All Districts Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                    <TableHead className="font-semibold">District</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    <TableHead className="font-semibold text-right">Genuine</TableHead>
                    <TableHead className="font-semibold text-right">
                      Suspicious
                    </TableHead>
                    <TableHead className="font-semibold text-right">Fake</TableHead>
                    <TableHead className="font-semibold text-right">
                      Risk Level
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.districtData.map((district) => (
                    <TableRow key={district.district} className="hover:bg-neutral-50">
                      <TableCell className="font-medium">{district.district}</TableCell>
                      <TableCell className="text-right">{district.total}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {district.genuine}
                      </TableCell>
                      <TableCell className="text-right text-yellow-600">
                        {district.suspicious}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {district.fake}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium ${
                            district.risk_level === 'high'
                              ? 'bg-red-100 text-red-800'
                              : district.risk_level === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {district.risk_level.toUpperCase()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
