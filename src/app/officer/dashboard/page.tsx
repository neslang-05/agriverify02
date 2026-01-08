'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatCard } from '@/components/farmer/stat-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getAnalytics } from '@/app/actions/analytics';
import { AnalyticsData } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#16a34a', '#ca8a04', '#dc2626'];

export default function OfficerDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

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

  const pieData = [
    { name: 'Genuine', value: analytics.genuineCount },
    { name: 'Suspicious', value: analytics.suspiciousCount },
    { name: 'Fake', value: analytics.fakeCount },
  ];

  const recentTrend = analytics.dailyTrend.slice(-7);

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
          <h1 className="text-2xl font-bold text-neutral-900">Officer Dashboard</h1>
          <p className="text-neutral-500 mt-1">
            Monitor verification trends and flagged products across districts.
          </p>
        </div>
        <Link href="/officer/analytics">
          <Button className="rounded-none bg-emerald-800 hover:bg-emerald-900">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Detailed Analytics
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Verifications"
          value={analytics.totalVerifications.toLocaleString()}
          icon={TrendingUp}
        />
        <StatCard
          title="Genuine Products"
          value={analytics.genuineCount.toLocaleString()}
          icon={CheckCircle2}
        />
        <StatCard
          title="Suspicious Products"
          value={analytics.suspiciousCount.toLocaleString()}
          icon={AlertTriangle}
        />
        <StatCard
          title="Fake Products"
          value={analytics.fakeCount.toLocaleString()}
          icon={XCircle}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="rounded-none shadow-md border-none">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle className="text-lg font-semibold text-neutral-900">
                Verification Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500" />
                  <span className="text-sm text-neutral-600">Genuine</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-yellow-500" />
                  <span className="text-sm text-neutral-600">Suspicious</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-red-500" />
                  <span className="text-sm text-neutral-600">Fake</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="rounded-none shadow-md border-none">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-800" />
                Daily Verification Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentTrend}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="genuine"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="suspicious"
                      stroke="#ca8a04"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="fake"
                      stroke="#dc2626"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Flagged Brands Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="rounded-none shadow-md border-none">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Top Flagged Brands
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                  <TableHead className="font-semibold">Brand Name</TableHead>
                  <TableHead className="font-semibold text-right">
                    Fake Count
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Last Detected
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topFlaggedBrands.map((brand, index) => (
                  <TableRow key={index} className="hover:bg-neutral-50">
                    <TableCell className="font-medium">{brand.brand_name}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-sm font-medium">
                        {brand.fake_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-neutral-500">
                      {new Date(brand.last_detected).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
