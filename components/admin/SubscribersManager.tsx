/**
 * Subscribers Manager
 *
 * Manages newsletter subscribers with CSV export functionality.
 */

'use client';

import { useState } from 'react';
import { CrudManager } from '@/lib/crud';
import { subscribersConfig } from './config/subscribersConfig';
import { Button } from '@/components/ui';

export default function SubscribersManager() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  /**
   * Handle CSV export
   */
  const handleExport = async () => {
    try {
      setExporting(true);
      setExportError(null);

      // Get CSRF token from distributed storage
      const { getOrCreateCsrfToken } = await import('@/lib/security/csrfDistributed');
      const csrfToken = await getOrCreateCsrfToken();

      // Call export API
      const response = await fetch('/api/admin/subscribers/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          // Optional: Allow user to select fields
          // fields: ['email', 'subscribed', 'created_at']
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      // Get the CSV blob
      const blob = await response.blob();

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
      const filename = filenameMatch?.[1] || 'subscribers-export.csv';

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Export Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={handleExport}
          disabled={exporting}
          variant="secondary"
          className="flex items-center gap-2"
        >
          {exporting ? (
            <>
              <span className="animate-spin">⏳</span>
              Exporting...
            </>
          ) : (
            <>
              <span>📥</span>
              Export to CSV
            </>
          )}
        </Button>
      </div>

      {/* Export Error */}
      {exportError && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          <strong>Export Failed:</strong> {exportError}
        </div>
      )}

      {/* CRUD Manager */}
      <CrudManager config={subscribersConfig} />
    </div>
  );
}
