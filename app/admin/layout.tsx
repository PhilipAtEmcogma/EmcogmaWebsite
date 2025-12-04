'use client';

import { ToastProvider } from '@/components/ui';

// Admin layout - auth is handled by middleware (proxy.ts)
// This layout provides the wrapper for admin pages with toast notifications
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
