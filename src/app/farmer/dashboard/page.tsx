'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Upload,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/farmer/stat-card';
import { VerificationBadge } from '@/components/farmer/verification-badge';
import { ConfidenceMeter } from '@/components/farmer/confidence-meter';
import { getFarmerStats } from '@/app/actions/analytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FarmerStats {
  totalVerifications: number;
  genuineCount: number;
  suspiciousCount: number;
  fakeCount: number;
  lastVerification: string;
  averageConfidence: number;
}

export default function FarmerDashboard() {
  const [stats, setStats] = useState<FarmerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getFarmerStats('demo-user');
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const recentStatus =
    stats.fakeCount > 0 ? 'fake' : stats.suspiciousCount > 0 ? 'suspicious' : 'genuine';

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
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">
            Welcome back! Here&apos;s your verification overview.
          </p>
        </div>
        <Link href="/farmer/verify">
          <Button className="rounded-none bg-emerald-800 hover:bg-emerald-900">
            <Upload className="h-4 w-4 mr-2" />
            Verify Product
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Verifications"
          value={stats.totalVerifications}
          icon={CheckCircle2}
        />
        <StatCard
          title="Genuine Products"
          value={stats.genuineCount}
          icon={CheckCircle2}
          description="Verified as authentic"
        />
        <StatCard
          title="Suspicious Products"
          value={stats.suspiciousCount}
          icon={AlertTriangle}
          description="Needs further check"
        />
        <StatCard
          title="Fake Products"
          value={stats.fakeCount}
          icon={XCircle}
          description="Identified as counterfeit"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Verification Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="rounded-none shadow-md border-none">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle className="text-lg font-semibold text-neutral-900">
                Recent Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Status</span>
                <VerificationBadge status={recentStatus} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Verified
                </span>
                <span className="text-neutral-900">
                  {new Date(stats.lastVerification).toLocaleDateString()}
                </span>
              </div>
              <Link href="/farmer/verify">
                <Button
                  variant="outline"
                  className="w-full rounded-none border-2 border-emerald-800 text-emerald-800 hover:bg-emerald-50"
                >
                  Start New Verification
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Confidence Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="rounded-none shadow-md border-none">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-800" />
                Average Confidence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-emerald-800">
                  {stats.averageConfidence}%
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Across all your verifications
                </p>
              </div>
              <ConfidenceMeter value={stats.averageConfidence} size="lg" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="rounded-none shadow-md border-none">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <CardTitle className="text-lg font-semibold text-neutral-900">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/farmer/verify">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-6 bg-emerald-50 text-center cursor-pointer transition-colors hover:bg-emerald-100"
                >
                  <Upload className="h-8 w-8 mx-auto text-emerald-800 mb-3" />
                  <p className="font-medium text-neutral-900">Verify Product</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Check seed or fertilizer
                  </p>
                </motion.div>
              </Link>
              <Link href="/farmer/recommendations">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-6 bg-blue-50 text-center cursor-pointer transition-colors hover:bg-blue-100"
                >
                  <CheckCircle2 className="h-8 w-8 mx-auto text-blue-800 mb-3" />
                  <p className="font-medium text-neutral-900">Get Recommendations</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Find certified seeds
                  </p>
                </motion.div>
              </Link>
              <Link href="/farmer/chat">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-6 bg-purple-50 text-center cursor-pointer transition-colors hover:bg-purple-100"
                >
                  <AlertTriangle className="h-8 w-8 mx-auto text-purple-800 mb-3" />
                  <p className="font-medium text-neutral-900">Ask AI Assistant</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Get farming guidance
                  </p>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
