'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCurrentUser, updateProfile } from '@/app/actions/auth';
import { DISTRICTS } from '@/types/index';

export default function FarmerProfilePage() {
  const [profile, setProfile] = useState<{
    id: string;
    full_name?: string;
    email: string;
    district?: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [district, setDistrict] = useState('');

  useEffect(() => {
    getCurrentUser().then((data) => {
      if (data) {
        setProfile(data);
        setDistrict(data.district || '');
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-neutral-500">Failed to load profile</div>
    );
  }

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    // district is managed via Select state; inject it into FormData before submitting
    if (district) formData.set('district', district);
    try {
      const result = await updateProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        const updated = await getCurrentUser();
        if (updated) setProfile(updated);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
        <p className="text-neutral-500 mt-1">View and update your account details</p>
      </motion.div>

      {/* Read-only info */}
      <Card className="rounded-none border border-neutral-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-700" />
            Account Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-600">{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-neutral-400" />
            <span className="capitalize text-neutral-600">{profile.role}</span>
          </div>
        </CardContent>
      </Card>

      {/* Editable form */}
      <Card className="rounded-none border border-neutral-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Profile updated successfully
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile.full_name || ''}
                className="rounded-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>District</Label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full rounded-none bg-emerald-800 hover:bg-emerald-700 text-white"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
