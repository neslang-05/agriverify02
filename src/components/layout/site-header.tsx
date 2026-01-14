import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/server';
import { GoogleTranslate } from './google-translate';

interface SiteHeaderProps {
  isRootPage?: boolean;
}

export async function SiteHeader({ isRootPage = false }: SiteHeaderProps) {
  let user = null;
  let profile = null;

  // Handle missing Supabase credentials gracefully
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase credentials not configured');
    } else {
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        profile = data;
      }
    }
  } catch (error) {
    console.warn('Error fetching user data:', error);
  }

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 lg:h-20 border-b border-neutral-200 bg-white px-4 lg:px-8 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="h-10 w-10 lg:h-12 lg:w-12 flex items-center justify-center bg-emerald-800 rounded-lg">
          <Leaf className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
        </div>
        <span className="text-xl lg:text-2xl font-bold text-neutral-900 hidden sm:inline notranslate">
          AgriVerify
        </span>
      </Link>

      {/* Language and Navigation */}
      <div className="flex items-center gap-4 lg:gap-6">
        <GoogleTranslate />

        {user ? (
          // Logged in: Show Dashboard link and Avatar
          <div className="flex items-center gap-4 lg:gap-6">
            <Link 
              href="/farmer/dashboard"
              className="text-sm lg:text-base text-neutral-600 hover:text-neutral-900 hidden sm:inline font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/farmer/history"
              className="text-sm lg:text-base text-neutral-600 hover:text-neutral-900 hidden md:inline font-medium"
            >
              History
            </Link>
            <Link href="/farmer/dashboard">
              <Avatar className="h-9 w-9 lg:h-11 lg:w-11 border-2 border-emerald-200">
                <AvatarFallback className="bg-emerald-100 text-emerald-800 text-sm lg:text-base font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        ) : isRootPage ? (
          // Not logged in + Root page: Show minimal link to About
          <div className="flex items-center gap-4">
            <Link 
              href="/about" 
              className="text-sm lg:text-base text-neutral-600 hover:text-neutral-900 font-medium"
            >
              About Us
            </Link>
            <Link href="/login" className="hidden sm:inline">
              <Button variant="outline" className="rounded-lg" size="sm">
                Login
              </Button>
            </Link>
          </div>
        ) : (
          // Not logged in + Other pages: Show Login/Signup
          <div className="flex items-center gap-2 lg:gap-3">
            <Link href="/login">
              <Button variant="ghost" className="rounded-lg" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-lg bg-emerald-800 hover:bg-emerald-900" size="sm">
                Signup
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
