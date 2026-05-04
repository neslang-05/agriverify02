import { Metadata } from 'next';
import { getAllComplaints } from '@/app/actions/complaints';
import { ComplaintTable } from './complaint-table';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Workflow - Fake Seed Detection',
  description: 'Manage complaint workflow and statuses',
};

export default async function WorkflowPage() {
  const complaints = await getAllComplaints();

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Complaint Workflow</h1>
            <p className="text-gray-600 mt-3 text-lg max-w-2xl">
              Track and update the investigation status for seed quality complaints submitted by farmers.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-full border shadow-sm self-start md:self-auto">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-600">Live Status Reports</span>
          </div>
        </div>

        <ComplaintTable initialComplaints={complaints} />
      </div>
    </div>
  );
}
