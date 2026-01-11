import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintCard } from '@/components/complaints/complaint-card';
import { getUserComplaints } from '@/app/actions/complaints';
import { Plus, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Complaints - Fake Seed Detection',
  description: 'View and track your seed quality complaints',
};

export default async function ComplaintsPage() {
  const complaints = await getUserComplaints();

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === 'open').length,
    investigating: complaints.filter((c) => c.status === 'investigating').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
            <p className="text-gray-600 mt-2">Track your reported seed quality issues</p>
          </div>
          <Link href="/farmer/complaints/new">
            <Button className="rounded-none bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Complaint
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Complaints</p>
            </CardContent>
          </Card>
          <Card className="rounded-none border-l-4 border-l-yellow-400">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
              <p className="text-sm text-gray-600">Open</p>
            </CardContent>
          </Card>
          <Card className="rounded-none border-l-4 border-l-blue-400">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.investigating}</div>
              <p className="text-sm text-gray-600">Investigating</p>
            </CardContent>
          </Card>
          <Card className="rounded-none border-l-4 border-l-green-400">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-sm text-gray-600">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Complaints List */}
        {complaints.length === 0 ? (
          <Card className="rounded-none">
            <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No complaints yet</h3>
              <p className="text-gray-600 mb-6">
                If you've experienced issues with seed quality, please report them to help protect the farming community.
              </p>
              <Link href="/farmer/complaints/new">
                <Button className="rounded-none bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  File Your First Complaint
                </Button>
              </Link>
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
  );
}
