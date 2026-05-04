'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/farmer/stat-card';
import { Badge } from '@/components/ui/badge';
import { getFarmerStats } from '@/app/actions/analytics';
import { getVerificationHistory, type VerificationHistoryItem } from '@/app/actions/history';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, historyResponse] = await Promise.all([
          getFarmerStats(),
          getVerificationHistory(10)
        ]);
        setStats(statsData);
        if (historyResponse.success && historyResponse.data) {
          setHistory(historyResponse.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusConfig = (item: VerificationHistoryItem) => {
    const tag = item.vision_ai_tag?.toLowerCase();
    
    if (tag === "pure" || item.status === "genuine") {
      return {
        label: "Pure Quality",
        badgeVariant: "default" as const
      };
    } else if (tag === "negative" || tag === "impure" || item.status === "fake") {
      return {
        label: "Negative Quality",
        badgeVariant: "destructive" as const
      };
    } else {
      return {
        label: "Suspicious",
        badgeVariant: "secondary" as const
      };
    }
  };

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
        <Link href="/farmer/quality">
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

      {/* Verification History Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="rounded-none shadow-md border-none">
          <CardHeader className="border-b border-neutral-200 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-neutral-900">
              Recent Verifications
            </CardTitle>
            <Link href="/farmer/history">
              <Button variant="outline" size="sm" className="rounded-none border-2 border-emerald-800 text-emerald-800 hover:bg-emerald-50">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {history.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                No verifications found. Start by verifying a product.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quality Score</TableHead>
                      <TableHead>AI Classification</TableHead>
                      <TableHead>Variety</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => {
                      const config = getStatusConfig(item);
                      const score = Math.round((item.vision_ai_confidence || item.confidence) * 100);
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(item.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={config.badgeVariant}>
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {score}%
                          </TableCell>
                          <TableCell>
                            {item.vision_ai_tag || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {item.seed_variety || 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
