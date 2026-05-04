'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Leaf, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { register } from '@/app/actions/auth';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    // Role is always 'farmer' — officers and admins are provisioned separately
    formData.set('role', 'farmer');
    try {
      await register(formData);
      // Success - will redirect
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
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
          <p className="text-neutral-500 mt-1">Farmer Registration</p>
        </div>

        <Card className="rounded-none shadow-lg border-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">
              Sign Up
            </CardTitle>
            <CardDescription className="text-center">
              Create your farmer account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm">
                {error}
              </div>
            )}
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Your full name"
                    required
                    className="rounded-none pl-10 border-2 focus:border-emerald-800 focus-visible:ring-0"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
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
                    placeholder="Create a password (min. 6 characters)"
                    required
                    minLength={6}
                    className="rounded-none pl-10 border-2 focus:border-emerald-800 focus-visible:ring-0"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Role is fixed as Farmer — Officers and Admins are provisioned by admins */}

              <Button
                type="submit"
                className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-emerald-800 hover:text-emerald-900"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
