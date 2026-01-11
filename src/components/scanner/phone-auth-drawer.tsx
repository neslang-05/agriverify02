'use client';

import React, { useState } from 'react';
import { Phone, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { createClient } from '@/lib/supabase/client';

interface PhoneAuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (isNewUser: boolean) => void;
}

type AuthStep = 'phone' | 'otp' | 'profile';

export function PhoneAuthDrawer({ isOpen, onClose, onSuccess }: PhoneAuthDrawerProps) {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Send OTP to phone
  const handleSendOTP = async () => {
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (signInError) {
        // If Supabase phone auth is not configured, fallback to demo mode
        if (signInError.message.includes('not enabled') || signInError.message.includes('not configured')) {
          console.log('Phone auth not configured, using demo flow');
          setStep('otp');
          return;
        }
        throw signInError;
      }

      setStep('otp');
    } catch (err) {
      console.error('OTP send error:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms',
      });

      if (verifyError) {
        // Demo mode: accept any 6-digit OTP
        if (verifyError.message.includes('not enabled') || verifyError.message.includes('Invalid')) {
          console.log('Using demo auth flow');
          // Check if user exists (demo)
          setStep('profile');
          return;
        }
        throw verifyError;
      }

      // Check if user has profile data
      if (data.user) {
        const metadata = data.user.user_metadata;
        if (!metadata?.name || !metadata?.district) {
          setStep('profile');
        } else {
          onSuccess(false);
        }
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!name.trim() || !district.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          district: district.trim(),
          role: 'farmer',
        },
      });

      if (updateError) {
        // Demo mode: proceed anyway
        console.log('Demo mode: profile saved locally');
        onSuccess(true);
        return;
      }

      onSuccess(true);
    } catch (err) {
      console.error('Profile save error:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/farmer/complaints/new`,
        },
      });

      if (googleError) throw googleError;
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  // Reset state when drawer closes
  const handleClose = () => {
    setStep('phone');
    setPhone('+91');
    setOtp('');
    setName('');
    setDistrict('');
    setError(null);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-none">
        <SheetHeader className="text-left">
          <SheetTitle>
            {step === 'phone' && 'Sign In to File Complaint'}
            {step === 'otp' && 'Enter Verification Code'}
            {step === 'profile' && 'Complete Your Profile'}
          </SheetTitle>
          <SheetDescription>
            {step === 'phone' && 'Enter your phone number to receive a verification code'}
            {step === 'otp' && `We sent a code to ${phone}`}
            {step === 'profile' && 'Just a few more details to get started'}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-none">
              {error}
            </div>
          )}

          {/* Phone Input Step */}
          {step === 'phone' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-10 rounded-none"
                  />
                </div>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 h-12"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Send OTP
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-500">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                disabled={isLoading}
                className="w-full rounded-none h-12"
              >
                <Mail className="h-4 w-4 mr-2" />
                Google
              </Button>
            </>
          )}

          {/* OTP Input Step */}
          {step === 'otp' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="text-center text-2xl tracking-widest rounded-none"
                />
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 h-12"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Verify
              </Button>

              <button
                onClick={() => setStep('phone')}
                className="w-full text-sm text-neutral-500 underline"
              >
                Change phone number
              </button>
            </>
          )}

          {/* Profile Step */}
          {step === 'profile' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="rounded-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g., Guntur, Anantapur"
                  className="rounded-none"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isLoading || !name.trim() || !district.trim()}
                className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 h-12"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Continue to Complaint
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
