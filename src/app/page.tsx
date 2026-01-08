import Link from 'next/link';
import { Leaf, Shield, Search, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center bg-emerald-800">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">AgriVerify</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="rounded-none">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-none bg-emerald-800 hover:bg-emerald-900">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Protect Your Crops from{' '}
              <span className="text-emerald-800">Fake Seeds & Fertilizers</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
              AI-powered verification system to detect counterfeit agricultural products.
              Ensure genuine seeds for better yields and protect your farming investment.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="rounded-none bg-emerald-800 hover:bg-emerald-900 px-8"
                >
                  Start Verifying
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none border-2 border-emerald-800 text-emerald-800 hover:bg-emerald-50 px-8"
                >
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">How It Works</h2>
            <p className="mt-4 text-neutral-600">
              Simple, fast, and reliable verification in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-neutral-50 border border-neutral-200">
              <div className="h-16 w-16 flex items-center justify-center bg-emerald-100 mx-auto mb-6">
                <Search className="h-8 w-8 text-emerald-800" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Upload Image
              </h3>
              <p className="text-neutral-600">
                Take a photo of the seed or fertilizer package label and upload it to our system.
              </p>
            </div>

            <div className="text-center p-8 bg-neutral-50 border border-neutral-200">
              <div className="h-16 w-16 flex items-center justify-center bg-emerald-100 mx-auto mb-6">
                <Shield className="h-8 w-8 text-emerald-800" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                AI Verification
              </h3>
              <p className="text-neutral-600">
                Our AI analyzes the image, extracts text, and checks against known databases.
              </p>
            </div>

            <div className="text-center p-8 bg-neutral-50 border border-neutral-200">
              <div className="h-16 w-16 flex items-center justify-center bg-emerald-100 mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-800" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Get Results
              </h3>
              <p className="text-neutral-600">
                Receive instant verification results with confidence scores and recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white">10,000+</p>
              <p className="mt-2 text-emerald-200">Products Verified</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">500+</p>
              <p className="mt-2 text-emerald-200">Fake Products Detected</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">15</p>
              <p className="mt-2 text-emerald-200">Districts Covered</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">95%</p>
              <p className="mt-2 text-emerald-200">Detection Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">For Everyone</h2>
            <p className="mt-4 text-neutral-600">
              Tailored experiences for farmers and government officers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border-2 border-neutral-200 hover:border-emerald-800 transition-colors">
              <div className="h-12 w-12 flex items-center justify-center bg-emerald-100 mb-6">
                <Leaf className="h-6 w-6 text-emerald-800" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                For Farmers
              </h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Verify seeds before purchase
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Get certified seed recommendations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  AI-powered farming guidance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Track verification history
                </li>
              </ul>
            </div>

            <div className="p-8 border-2 border-neutral-200 hover:border-emerald-800 transition-colors">
              <div className="h-12 w-12 flex items-center justify-center bg-emerald-100 mb-6">
                <BarChart3 className="h-6 w-6 text-emerald-800" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                For Government Officers
              </h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  View district-wise analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Track flagged products
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Monitor verification trends
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Export data reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center bg-emerald-800">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AgriVerify</span>
            </div>
            <p className="text-neutral-400 text-sm">
              © 2024 AgriVerify. Protecting farmers from counterfeit products.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
