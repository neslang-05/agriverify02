'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendOTP, verifyOTP } from '@/app/actions/auth';

export function PhoneLoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Ensure phone number is in E.164 format
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        // Default to India (+91) if no country code provided, as per context of Manipur
        formattedPhone = `+91${formattedPhone}`;
      }
      
      await sendOTP(formattedPhone);
      setPhone(formattedPhone);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await verifyOTP(phone, otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.form
            key="phone-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
            onSubmit={handleSendOTP}
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-none pl-10 border-2 focus:border-emerald-800 focus-visible:ring-0"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 border border-red-100">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 group"
              disabled={isLoading || !phone}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="otp-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
            onSubmit={handleVerifyOTP}
          >
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 mb-2">
                <MessageSquare className="h-6 w-6 text-emerald-800" />
              </div>
              <p className="text-sm text-neutral-600">
                Enter the 6-digit code sent to <span className="font-semibold text-neutral-900">{phone}</span>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-center">
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="rounded-none text-center text-2xl tracking-[1em] h-14 border-2 focus:border-emerald-800 focus-visible:ring-0"
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 border border-red-100 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Verify & Sign In
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-sm text-neutral-500 hover:text-emerald-800 transition-colors"
              disabled={isLoading}
            >
              Change phone number
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
