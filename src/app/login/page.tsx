'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Leaf, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { login } from '@/app/actions/auth';
import { FarmerAuthOptions } from '@/components/auth/farmer-auth-options';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(formData);
      // Success - will redirect
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
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
          <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-800 mb-4 shadow-xl">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">AgriVerify</h1>
          <p className="text-neutral-500 mt-1">AI-Based Seed & Fertilizer Detection</p>
        </div>

        <Card className="rounded-none shadow-2xl border-none overflow-hidden">
          <CardHeader className="space-y-1 pb-6 pt-8 bg-emerald-800 text-white">
            <CardTitle className="text-xl font-semibold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center text-emerald-100/80">
              Access your agricultural dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    className="rounded-none pl-10 pr-10 border-2 focus:border-emerald-800 focus-visible:ring-0"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 h-12"
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

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-400 font-medium tracking-wider">Farmer Quick Login</span>
              </div>
            </div>

            <FarmerAuthOptions />

            <p className="pt-4 text-center text-sm text-neutral-500">
              New to AgriVerify?{' '}
              <Link
                href="/register"
                className="font-medium text-emerald-800 hover:text-emerald-900 border-b-2 border-emerald-800 pb-0.5"
              >
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
