'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export function ProtectedRoute({ children, requireProfile = true }: ProtectedRouteProps) {
  const { firebaseUser, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser) {
        // Not authenticated, redirect to login
        router.push(ROUTES.LOGIN);
      } else if (requireProfile && !user) {
        // Authenticated but no profile, redirect to setup
        router.push(ROUTES.SETUP_PROFILE);
      }
    }
  }, [firebaseUser, user, loading, router, requireProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!firebaseUser || (requireProfile && !user)) {
    return null;
  }

  return <>{children}</>;
}
