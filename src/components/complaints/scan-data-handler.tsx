'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const SCAN_DATA_KEY = 'agriverify_guest_scan';

interface ScanData {
  images: string[];
  result: {
    status: 'good' | 'bad';
    emoji: string;
    message: string;
    avgGood: number;
    avgBad: number;
  };
  timestamp: number;
}

export function ScanDataHandler() {
  const [scanData, setScanData] = useState<ScanData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SCAN_DATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ScanData;
        // Only use if data is less than 30 minutes old
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setScanData(parsed);
        } else {
          localStorage.removeItem(SCAN_DATA_KEY);
        }
      }
    } catch (e) {
      console.error('Error reading scan data:', e);
    }
  }, []);

  if (!scanData) return null;

  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-none">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-900">
            Scan Results Attached
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            Your scanned images and analysis results have been attached to this complaint.
          </p>
          
          {/* Image thumbnails */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {scanData.images.slice(0, 4).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Scanned image ${index + 1}`}
                className="h-16 w-16 object-cover rounded-none border border-amber-300"
              />
            ))}
            {scanData.images.length > 4 && (
              <div className="h-16 w-16 flex items-center justify-center bg-amber-100 border border-amber-300 text-amber-700 text-sm font-medium">
                +{scanData.images.length - 4}
              </div>
            )}
          </div>

          {/* Analysis result */}
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="text-amber-900 font-medium">AI Analysis:</span>
            <span className={scanData.result.status === 'bad' ? 'text-red-600' : 'text-green-600'}>
              {scanData.result.status === 'bad' ? 'Quality Issues Detected' : 'Quality Passed'}
            </span>
            <span>{scanData.result.emoji}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to get scan data for use in complaint form
 */
export function useScanData() {
  const [scanData, setScanData] = useState<ScanData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SCAN_DATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ScanData;
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setScanData(parsed);
        }
      }
    } catch (e) {
      console.error('Error reading scan data:', e);
    }
  }, []);

  const clearScanData = () => {
    localStorage.removeItem(SCAN_DATA_KEY);
    setScanData(null);
  };

  return { scanData, clearScanData };
}
