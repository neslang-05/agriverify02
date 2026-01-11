import { Suspense } from 'react';
import { SiteHeader } from '@/components/layout';
import { ScannerFlow } from '@/components/scanner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Server Component Header */}
      <Suspense fallback={<HeaderSkeleton />}>
        <SiteHeader isRootPage />
      </Suspense>
      
      {/* Camera Scanner - Full height minus header */}
      <main className="flex-1 flex flex-col">
        <ScannerFlow />
      </main>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-emerald-800 animate-pulse" />
        <div className="h-5 w-24 bg-neutral-200 animate-pulse hidden sm:block" />
      </div>
      <div className="h-4 w-16 bg-neutral-200 animate-pulse" />
    </header>
  );
}
