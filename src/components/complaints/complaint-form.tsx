'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { submitComplaint } from '@/app/actions/complaints';
import { ComplaintIssueType } from '@/types/complaints';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface SelectFromHistoryProps {
  onSelect?: (data: any) => void;
  verifications?: any[];
  fromScan?: boolean;
}

export function ComplaintForm({ onSelect, verifications = [], fromScan = false }: SelectFromHistoryProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    batchNumber: '',
    brandName: '',
    cropType: '',
    district: '',
    issueType: '' as ComplaintIssueType,
    description: '',
    daysSinceSowing: '',
    severityScore: '3',
    verificationId: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successBatchNumber, setSuccessBatchNumber] = useState('');

  // Pre-fill issue type when coming from scan flow
  useEffect(() => {
    if (fromScan) {
      setFormData((prev) => ({
        ...prev,
        issueType: 'fake_seeds' as ComplaintIssueType,
      }));
    }
  }, [fromScan]);

  const handleHistorySelect = (verificationId: string) => {
    const verification = verifications.find((v) => v.id === verificationId);
    if (verification) {
      setSelectedVerification(verificationId);
      setFormData((prev) => ({
        ...prev,
        batchNumber: verification.batch_number || '',
        brandName: verification.brand_name || '',
        cropType: verification.crop_type || '',
        verificationId: verificationId,
      }));
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.batchNumber || !formData.brandName || !formData.cropType || !formData.district || !formData.issueType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await submitComplaint({
        batchNumber: formData.batchNumber,
        brandName: formData.brandName,
        cropType: formData.cropType,
        district: formData.district,
        issueType: formData.issueType,
        description: formData.description || undefined,
        daysSinceSowing: formData.daysSinceSowing ? parseInt(formData.daysSinceSowing) : undefined,
        severityScore: formData.severityScore ? parseInt(formData.severityScore) : undefined,
        verificationId: formData.verificationId || undefined,
      });

      if (result.success) {
        setSuccessBatchNumber(formData.batchNumber);
        setShowSuccess(true);
        toast.success('Complaint registered successfully!');
        
        setTimeout(() => {
          router.push('/farmer/complaints');
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('An error occurred while submitting the complaint');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="rounded-none w-full max-w-md border-l-4 border-l-green-600">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-center text-2xl text-green-600">
              Complaint Registered
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-700">
              Government has been notified about Batch <span className="font-bold">#{successBatchNumber}</span>
            </p>
            <p className="text-sm text-gray-600">
              Our team will investigate this matter and take appropriate action.
            </p>
            <p className="text-xs text-gray-500">
              Redirecting you to your complaints...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Option A: Select from History */}
      {verifications && verifications.length > 0 && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-base">Did you face issues with a previously verified packet?</CardTitle>
            <CardDescription>Select from your verification history</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedVerification || ''} onValueChange={handleHistorySelect}>
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder="Choose from verification history" />
              </SelectTrigger>
              <SelectContent>
                {verifications.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.brand_name} - {v.crop_type} ({v.batch_number}) - {new Date(v.created_at).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-lg">Report Product Issue</CardTitle>
            <CardDescription>Help us identify problematic seed batches through your feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Batch Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Product Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchNumber" className="text-gray-700 font-medium">
                    Batch Number <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="batchNumber"
                    placeholder="e.g., RICE-2024-001"
                    value={formData.batchNumber}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    className="rounded-none"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="brandName" className="text-gray-700 font-medium">
                    Brand Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="brandName"
                    placeholder="e.g., GreenSeeds Ltd"
                    value={formData.brandName}
                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                    className="rounded-none"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cropType" className="text-gray-700 font-medium">
                    Crop Type <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="cropType"
                    placeholder="e.g., Paddy, Wheat"
                    value={formData.cropType}
                    onChange={(e) => handleInputChange('cropType', e.target.value)}
                    className="rounded-none"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="district" className="text-gray-700 font-medium">
                    District <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="district"
                    placeholder="e.g., District A"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="rounded-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Issue Details */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Issue Details</h3>
              
              <div>
                <Label htmlFor="issueType" className="text-gray-700 font-medium">
                  Type of Issue <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) => handleInputChange('issueType', value)}
                >
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor_germination">Poor Germination</SelectItem>
                    <SelectItem value="stunted_growth">Stunted Growth</SelectItem>
                    <SelectItem value="no_yield">No Yield</SelectItem>
                    <SelectItem value="pest_susceptibility">Pest Susceptibility</SelectItem>
                    <SelectItem value="physical_impurity">Physical Impurity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue you experienced with the seeds..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="rounded-none min-h-[120px]"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="daysSinceSowing" className="text-gray-700 font-medium">
                    Days Since Sowing
                  </Label>
                  <Input
                    id="daysSinceSowing"
                    type="number"
                    placeholder="e.g., 15"
                    value={formData.daysSinceSowing}
                    onChange={(e) => handleInputChange('daysSinceSowing', e.target.value)}
                    className="rounded-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">When did you notice the issue?</p>
                </div>

                <div>
                  <Label htmlFor="severityScore" className="text-gray-700 font-medium">
                    Severity (1-5)
                  </Label>
                  <Select
                    value={formData.severityScore}
                    onValueChange={(value) => handleInputChange('severityScore', value)}
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Minor Issue</SelectItem>
                      <SelectItem value="2">2 - Low Severity</SelectItem>
                      <SelectItem value="3">3 - Medium Severity</SelectItem>
                      <SelectItem value="4">4 - High Severity</SelectItem>
                      <SelectItem value="5">5 - Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-none p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Your feedback helps us protect other farmers.</p>
                <p>When multiple complaints are reported for the same batch, our team takes action.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-none flex-1"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-none flex-1 bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Complaint'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
