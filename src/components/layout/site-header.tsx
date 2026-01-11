import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/server';

interface SiteHeaderProps {
  isRootPage?: boolean;
}

export async function SiteHeader({ isRootPage = false }: SiteHeaderProps) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const user = session?.user;
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-4 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center bg-emerald-800">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-neutral-900 hidden sm:inline">
          AgriVerify
        </span>
      </Link>

      {/* Navigation */}
      {session ? (
        // Logged in: Show Dashboard link and Avatar
        <div className="flex items-center gap-3">
          <Link 
            href="/farmer/dashboard"
            className="text-sm text-neutral-600 hover:text-neutral-900 hidden sm:inline"
          >
            Dashboard
          </Link>
          <Link href="/farmer/dashboard">
            <Avatar className="h-9 w-9 border border-neutral-200">
              <AvatarFallback className="bg-emerald-100 text-emerald-800 text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      ) : isRootPage ? (
        // Not logged in + Root page: Show minimal link to About
        <Link 
          href="/about" 
          className="text-sm text-neutral-600 hover:text-neutral-900 underline"
        >
          About Us
        </Link>
      ) : (
        // Not logged in + Other pages: Show Login/Signup
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="rounded-none" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-none bg-emerald-800 hover:bg-emerald-900" size="sm">
              Signup
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
