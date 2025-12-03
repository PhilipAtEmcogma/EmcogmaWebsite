// Admin layout - auth is handled by middleware (proxy.ts)
// This layout just provides the wrapper for admin pages
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
