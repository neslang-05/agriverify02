import { Metadata } from 'next';
import { ComplaintForm } from '@/components/complaints/complaint-form';
import { getUserVerifications } from '@/app/actions/history';
import { ScanDataHandler } from '@/components/complaints/scan-data-handler';

export const metadata: Metadata = {
  title: 'Report Complaint - Fake Seed Detection',
  description: 'Report quality issues with seed packets to help protect farmers',
};

interface PageProps {
  searchParams: Promise<{ from_scan?: string }>;
}

export default async function ComplaintNewPage({ searchParams }: PageProps) {
  const verifications = await getUserVerifications();
  const params = await searchParams;
  const fromScan = params.from_scan === 'true';

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report a Product Issue</h1>
          <p className="text-gray-600 mt-2">Help us identify problematic seed batches and protect farmers like you</p>
        </div>

        {/* Handle scan data from guest flow */}
        {fromScan && <ScanDataHandler />}

        <ComplaintForm verifications={verifications} fromScan={fromScan} />
      </div>
    </div>
  );
}
