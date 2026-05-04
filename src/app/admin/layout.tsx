'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  Users,
  ScrollText,
  LogOut,
  Menu,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/actions/auth';
import { GoogleTranslate } from '@/components/layout/google-translate';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  // { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 h-16 border-b border-neutral-200">
            <div className="h-10 w-10 flex items-center justify-center bg-indigo-800">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">AgriVerify</span>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${isActive
                        ? 'bg-indigo-50 border-l-4 border-indigo-800 text-indigo-800'
                        : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-neutral-200">
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start rounded-none text-neutral-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 px-4 lg:px-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Shield className="h-4 w-4" />
            <span>Admin Panel</span>
          </div>

          <div className="flex items-center gap-4">
            <GoogleTranslate />
            <div className="h-8 w-8 flex items-center justify-center bg-indigo-100 text-indigo-800 font-semibold">
              A
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
