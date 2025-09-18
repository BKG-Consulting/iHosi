'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Loader2 } from 'lucide-react';

interface AuthRedirectWrapperProps {
  children: React.ReactNode;
}

export function AuthRedirectWrapper({ children }: AuthRedirectWrapperProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to appropriate dashboard
    if (!loading && user) {
      const redirectPath = getRedirectPath(user.role);
      console.log('User already authenticated, redirecting to:', redirectPath);
      // Use window.location.href to force a full page reload and clear any cached state
      window.location.href = redirectPath;
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-sm text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // If user is authenticated, don't render children (will redirect)
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-sm text-gray-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  // User is not authenticated, show auth forms
  return <>{children}</>;
}

function getRedirectPath(role: string): string {
  switch (role.toLowerCase()) {
    case 'doctor':
      return '/doctor';
    case 'patient':
      return '/patient';
    case 'admin':
      return '/admin';
    case 'nurse':
      return '/nurse';
    case 'staff':
      return '/staff';
    default:
      return '/dashboard';
  }
}
