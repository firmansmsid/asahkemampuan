'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, fetchProfile } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" label="Memuat..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
