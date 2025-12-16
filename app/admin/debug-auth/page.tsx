'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setAuthInfo({ error: sessionError.message });
          setLoading(false);
          return;
        }

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          setAuthInfo({ error: userError.message });
          setLoading(false);
          return;
        }

        // Check if user is admin by calling is_admin() function
        const { data: adminCheck, error: adminError } = await supabase
          .rpc('is_admin');

        setAuthInfo({
          session: {
            accessToken: session?.access_token ? 'EXISTS (hidden)' : 'MISSING',
            expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A',
          },
          user: {
            id: user?.id,
            email: user?.email,
            provider: user?.app_metadata?.provider,
            emailVerified: user?.email_confirmed_at ? 'Yes' : 'No',
          },
          jwt: {
            email: user?.email || 'NULL',
            role: user?.role,
          },
          isAdmin: adminCheck,
          adminCheckError: adminError?.message,
        });
      } catch (err: any) {
        setAuthInfo({ error: err.message });
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-darker p-8">
        <div className="max-w-4xl mx-auto">
          <div className="card-cyber p-8">
            <p className="text-gray-400">Loading authentication info...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-darker p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a href="/admin" className="text-cyber-primary hover:text-cyber-secondary transition-colors">
            ← Back to Admin Dashboard
          </a>
        </div>

        <div className="card-cyber p-8">
          <h1 className="text-3xl font-bold gradient-text mb-6">
            Authentication Debug Info
          </h1>

          {authInfo?.error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
              <p className="text-red-400">Error: {authInfo.error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Session Info */}
              <div>
                <h2 className="text-xl font-semibold text-cyber-primary mb-3">Session</h2>
                <div className="bg-cyber-darker/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Access Token:</span>
                    <span className="text-white font-mono">{authInfo?.session?.accessToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expires At:</span>
                    <span className="text-white font-mono">{authInfo?.session?.expiresAt}</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-xl font-semibold text-cyber-primary mb-3">User</h2>
                <div className="bg-cyber-darker/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="text-white font-mono text-sm">{authInfo?.user?.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className={`font-mono ${authInfo?.user?.email ? 'text-green-400' : 'text-red-400'}`}>
                      {authInfo?.user?.email || 'NULL (PROBLEM!)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Provider:</span>
                    <span className="text-white font-mono">{authInfo?.user?.provider || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email Verified:</span>
                    <span className="text-white font-mono">{authInfo?.user?.emailVerified}</span>
                  </div>
                </div>
              </div>

              {/* JWT Info */}
              <div>
                <h2 className="text-xl font-semibold text-cyber-primary mb-3">JWT Claims</h2>
                <div className="bg-cyber-darker/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email Claim:</span>
                    <span className={`font-mono ${authInfo?.jwt?.email ? 'text-green-400' : 'text-red-400'}`}>
                      {authInfo?.jwt?.email || 'NULL (PROBLEM!)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role:</span>
                    <span className="text-white font-mono">{authInfo?.jwt?.role || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Admin Check */}
              <div>
                <h2 className="text-xl font-semibold text-cyber-primary mb-3">Admin Status</h2>
                <div className="bg-cyber-darker/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">is_admin():</span>
                    <span className={`font-mono font-bold ${authInfo?.isAdmin ? 'text-green-400' : 'text-red-400'}`}>
                      {authInfo?.isAdmin ? 'TRUE ✓' : 'FALSE ✗'}
                    </span>
                  </div>
                  {authInfo?.adminCheckError && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Error:</span>
                      <span className="text-red-400 font-mono text-sm">{authInfo.adminCheckError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mt-8 p-6 border-2 border-cyber-primary/30 rounded-lg">
                <h2 className="text-xl font-semibold text-cyber-primary mb-4">Diagnosis</h2>
                {authInfo?.user?.email && authInfo?.isAdmin ? (
                  <div className="space-y-2">
                    <p className="text-green-400 font-semibold">✓ Authentication is working correctly!</p>
                    <p className="text-gray-300">Your JWT has an email and you are recognized as an admin.</p>
                    <p className="text-gray-300">You should be able to delete subscribers.</p>
                  </div>
                ) : !authInfo?.user?.email ? (
                  <div className="space-y-2">
                    <p className="text-red-400 font-semibold">✗ JWT Email is NULL</p>
                    <p className="text-gray-300">Your OAuth session doesn't have an email claim.</p>
                    <p className="text-gray-300 mt-3">Try these steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-400 ml-4">
                      <li>Check that OAuth providers are enabled in Supabase Dashboard</li>
                      <li>Verify OAuth callback URLs are correct</li>
                      <li>Sign out completely from /admin/login</li>
                      <li>Clear all browser cookies for localhost:3001</li>
                      <li>Sign in fresh with Google OAuth</li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-yellow-400 font-semibold">⚠ Email exists but not recognized as admin</p>
                    <p className="text-gray-300">Your email: <span className="text-white font-mono">{authInfo?.user?.email}</span></p>
                    <p className="text-gray-300 mt-3">Run this SQL in Supabase SQL Editor:</p>
                    <pre className="bg-cyber-darker p-3 rounded text-sm text-gray-300 mt-2 overflow-x-auto">
{`INSERT INTO admin_users (email, active)
VALUES ('${authInfo?.user?.email}', true)
ON CONFLICT (email) DO UPDATE SET active = true;`}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
