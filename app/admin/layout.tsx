'use client';

import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/lib/errors';

// Admin layout - auth is handled by middleware (proxy.ts)
// This layout provides the wrapper for admin pages with toast notifications and error handling
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ToastProvider>{children}</ToastProvider>
    </ErrorBoundary>
  );
}
