'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav';
import { Users, Shield, Wand2, Building, Menu, Bookmark, Plus } from 'lucide-react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Home' },
    { href: '/dashboard/seo-generator', icon: Wand2, label: 'SEO Generator' },
    { href: '/dashboard/saved-topics', icon: Bookmark, label: 'Saved Topics' },
    // { href: '/dashboard/citation-tracker', icon: Building, label: 'Citation Tracker' },
    { href: '/dashboard/security', icon: Shield, label: 'Settings' }
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-20 flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Dashboard</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 mt-16 lg:mt-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="h-full overflow-y-auto p-4 pt-20 lg:pt-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={`shadow-none my-1 w-full justify-start ${
                  pathname === item.href ? 'bg-gray-100' : ''
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-20 lg:pt-0 pb-16 lg:pb-0 scrollbar-hide">
        <div className="p-4 lg:p-6 h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onQuickAction={() => {
          // Navigate to SEO generator or open quick action modal
          window.location.href = '/dashboard/seo-generator';
        }}
      />
    </div>
  );
}
