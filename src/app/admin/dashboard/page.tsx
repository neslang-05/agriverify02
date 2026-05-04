import { Suspense } from 'react';
import Link from 'next/link';
import { Users, ShieldAlert, FileText, BarChart3, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSystemUsers } from '@/app/actions/admin';
import { getComplaintStats } from '@/app/actions/complaints';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

async function AdminStats() {
  const [users, complaintStats] = await Promise.all([
    getSystemUsers(),
    getComplaintStats(),
  ]);

  const farmers = users.filter((u: { role: string }) => u.role === 'farmer').length;
  const officers = users.filter((u: { role: string }) => u.role === 'officer').length;
  const total = users.length;

  const stats = [
    {
      title: 'Total Users',
      value: total,
      sub: `${farmers} farmers · ${officers} officers`,
      icon: Users,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
    },
    {
      title: 'High-Risk Batches',
      value: complaintStats.highRiskBatchesCount,
      sub: 'Flagged in registry',
      icon: ShieldAlert,
      color: 'text-red-700',
      bg: 'bg-red-50',
    },
    {
      title: "Today's Complaints",
      value: complaintStats.todayComplaintsCount,
      sub: 'Submitted today',
      icon: FileText,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      title: 'Worst District',
      value: complaintStats.worstPerformingDistrict,
      sub: 'Most complaints',
      icon: BarChart3,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.title} className="rounded-none border border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{s.title}</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{s.value}</p>
                  <p className="text-xs text-neutral-400 mt-1">{s.sub}</p>
                </div>
                <div className={`p-2 ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-neutral-500 mt-1">System overview and management</p>
      </div>

      <Suspense fallback={<LoadingSpinner size="lg" text="Loading stats..." />}>
        <AdminStats />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-none border border-neutral-200">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-between rounded-none">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Manage Users
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/users/create-officer">
              <Button variant="outline" className="w-full justify-between rounded-none mt-2">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> Create Officer Account
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/audit-logs">
              <Button variant="outline" className="w-full justify-between rounded-none mt-2">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> View Audit Logs
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-none border border-neutral-200">
          <CardHeader>
            <CardTitle className="text-base">System Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/officer/dashboard">
              <Button variant="outline" className="w-full justify-between rounded-none">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Officer Dashboard
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/officer/complaints">
              <Button variant="outline" className="w-full justify-between rounded-none mt-2">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> Batch Risk Registry
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
