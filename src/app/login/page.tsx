'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Leaf, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await login(formData);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-800 mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">AgriVerify</h1>
          <p className="text-neutral-500 mt-1">AI-Based Seed & Fertilizer Detection</p>
        </div>

        <Card className="rounded-none shadow-lg border-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="farmer@demo.com"
                    required
                    className="rounded-none pl-10 border-2 focus:border-emerald-800 focus-visible:ring-0"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter any password"
                    required
                    className="rounded-none pl-10 border-2 focus:border-emerald-800 focus-visible:ring-0"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-500">Demo Accounts</span>
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="p-3 bg-neutral-50 border border-neutral-200">
                  <p className="font-medium text-neutral-700">Farmer Account</p>
                  <p className="text-neutral-500">farmer@demo.com</p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200">
                  <p className="font-medium text-neutral-700">Officer Account</p>
                  <p className="text-neutral-500">officer@demo.com</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-emerald-800 hover:text-emerald-900"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
