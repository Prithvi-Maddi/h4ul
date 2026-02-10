'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { firebaseUser, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (firebaseUser && user) {
        router.push(ROUTES.FEED);
      } else if (firebaseUser && !user) {
        router.push(ROUTES.SETUP_PROFILE);
      }
    }
  }, [firebaseUser, user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="max-w-md mx-auto px-4 py-12 flex flex-col min-h-screen">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">h4ul</h1>
          <p className="text-gray-600">Your fashion diary</p>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col justify-center">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Document your wardrobe.
              <br />
              Discover new styles.
            </h2>
            <p className="text-gray-600 max-w-xs mx-auto">
              Join the community of fashion-forward people sharing their latest finds and style inspiration.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 space-y-3">
            <Link href={ROUTES.SIGNUP} className="block">
              <Button fullWidth size="lg">
                Get Started
              </Button>
            </Link>
            <Link href={ROUTES.LOGIN} className="block">
              <Button variant="outline" fullWidth size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-12">
          <p>Built for fashion lovers</p>
        </footer>
      </div>
    </div>
  );
}
