'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wand2,
  Bookmark,
  Shield,
  Home,
  Sparkles,
  Plus
} from 'lucide-react';

interface MobileBottomNavProps {
  onQuickAction?: () => void;
}

export function MobileBottomNav({ onQuickAction }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Home',
      active: pathname === '/dashboard'
    },
    {
      href: '/dashboard/seo-generator',
      icon: Wand2,
      label: 'Generate',
      active: pathname === '/dashboard/seo-generator'
    },
    {
      href: '/dashboard/saved-topics',
      icon: Bookmark,
      label: 'Saved',
      active: pathname === '/dashboard/saved-topics'
    },
    {
      href: '/dashboard/security',
      icon: Shield,
      label: 'Settings',
      active: pathname === '/dashboard/security'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              item.active
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(item.href)}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {item.label === 'Generate' && (
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                </div>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Quick Action Button */}
      {onQuickAction && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <Button
            size="sm"
            onClick={onQuickAction}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}