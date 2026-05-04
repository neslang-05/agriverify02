import { Metadata } from 'next';
import { getAllComplaints } from '@/app/actions/complaints';
import { KanbanBoard } from './kanban-board';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Workflow - Fake Seed Detection',
  description: 'Manage complaint workflow and statuses',
};

export default async function WorkflowPage() {
  const complaints = await getAllComplaints();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complaint Workflow</h1>
          <p className="text-gray-600 mt-2">Manage the investigation process for seed complaints</p>
        </div>

        <KanbanBoard initialComplaints={complaints} />
      </div>
    </div>
  );
}
