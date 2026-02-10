'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusSquare, LayoutGrid, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/create', icon: PlusSquare, label: 'Create' },
  { href: '/wardrobe', icon: LayoutGrid, label: 'Wardrobe' },
  { href: '/profile', icon: User, label: 'Profile' }
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const href = item.href === '/profile' && user
            ? `/profile/${user.username}`
            : item.href;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <item.icon
                className={cn('w-6 h-6', isActive && 'fill-current')}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
