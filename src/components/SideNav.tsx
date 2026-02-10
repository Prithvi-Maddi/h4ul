'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusSquare, LayoutGrid, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const mainNavItems = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/create', icon: PlusSquare, label: 'Create' },
  { href: '/wardrobe', icon: LayoutGrid, label: 'Wardrobe' },
  { href: '/collections', icon: LayoutGrid, label: 'Collections' }
];

export function SideNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r p-4">
      {/* Logo */}
      <Link href="/feed" className="mb-8">
        <h1 className="text-2xl font-bold text-purple-600">h4ul</h1>
      </Link>

      {/* Main Nav */}
      <div className="flex-1 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Profile */}
        {user && (
          <Link
            href={`/profile/${user.username}`}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              pathname.startsWith('/profile')
                ? 'bg-purple-50 text-purple-600'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </Link>
        )}
      </div>

      {/* Bottom actions */}
      <div className="space-y-1 pt-4 border-t">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            pathname === '/settings'
              ? 'bg-purple-50 text-purple-600'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </nav>
  );
}
