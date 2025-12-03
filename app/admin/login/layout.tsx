export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth check for login page - just render the children
  return <>{children}</>;
}
