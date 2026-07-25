'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Preloader from '@/components/layout/Preloader';
import { initAttributionTracking } from '@/lib/lead-tracking';

/**
 * Conditionally mounts public-site chrome (Preloader + Footer)
 * only on non-admin routes. This completely avoids React Rules of
 * Hooks violations — admin routes never mount these components at all.
 * Also initializes lead attribution tracking on public routes.
 */
export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (!isAdmin) {
      initAttributionTracking();
    }
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Preloader />
      {children}
      <Footer />
    </>
  );
}
