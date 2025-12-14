/**
 * Subscribers CSV Export API
 *
 * Admin-only endpoint for exporting subscriber data as CSV.
 *
 * Security Features:
 * - Session-based admin verification
 * - Rate limiting (3 exports/hour)
 * - CSRF protection
 * - Audit logging (database + security logger)
 * - Server-side only processing
 * - Streaming file download (no JSON in network tab)
 * - CSV injection prevention
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth/admin';
import {
  performSecurityCheck,
  RATE_LIMITS,
  getRequestContext,
  SecurityLog,
} from '@/lib/security';
import {
  generateCsv,
  createCsvFilename,
  formatDateForCsv,
  formatBooleanForCsv,
} from '@/lib/utils/csv';
import type { Subscriber } from '@/lib/types';

/**
 * POST /api/admin/subscribers/export
 *
 * Export subscribers as CSV file
 *
 * Request Body:
 * {
 *   fields?: string[] // Optional field selection
 * }
 *
 * Response: CSV file download (Content-Type: text/csv)
 */
export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    // ========================================
    // 1. ADMIN VERIFICATION
    // ========================================
    const adminUser = await getAdminUser();

    if (!adminUser || !adminUser.email) {
      SecurityLog.dataExportUnauthorized(context, 'subscribers');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // 2. SECURITY CHECKS (Rate Limiting + CSRF)
    // ========================================
    const securityCheck = await performSecurityCheck(request, {
      rateLimit: RATE_LIMITS.export, // 3 exports per hour
      requireCsrf: true, // CSRF token required
      validateBody: true,
      maxBodySize: 1024, // 1KB max (only field selection)
    });

    if (!securityCheck.passed) {
      SecurityLog.dataExportFailure(
        context,
        adminUser.email,
        'subscribers',
        'Security check failed'
      );
      return securityCheck.response!;
    }

    // ========================================
    // 3. PARSE REQUEST BODY
    // ========================================
    let requestBody: { fields?: string[] } = {};
    try {
      const body = await request.json();
      requestBody = body || {};
    } catch {
      // Empty body is OK, use defaults
    }

    // Default fields to export (security: exclude internal IDs)
    const defaultFields: (keyof Subscriber)[] = ['email', 'subscribed', 'created_at'];

    // Validate requested fields (prevent injection of non-existent fields)
    const allowedFields: (keyof Subscriber)[] = [
      'email',
      'subscribed',
      'created_at',
    ];

    const fieldsToExport = requestBody.fields
      ? requestBody.fields.filter(
          (f): f is keyof Subscriber => allowedFields.includes(f as keyof Subscriber)
        )
      : defaultFields;

    // ========================================
    // 4. FETCH SUBSCRIBERS (Server-Side Only)
    // ========================================
    const supabase = await createClient();

    const { data: subscribers, error: fetchError } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      // Environment-aware logging (no sensitive data in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching subscribers for export:', fetchError);
      }

      SecurityLog.dataExportFailure(
        context,
        adminUser.email,
        'subscribers',
        'Database query failed'
      );

      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch subscribers' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'No subscribers to export' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // 5. TRANSFORM DATA FOR CSV
    // ========================================
    // Format data for CSV (handle dates, booleans, etc.)
    const transformedData = subscribers.map((sub) => ({
      email: sub.email,
      subscribed: formatBooleanForCsv(sub.subscribed),
      created_at: formatDateForCsv(sub.created_at),
    }));

    // ========================================
    // 6. GENERATE CSV
    // ========================================
    const csvContent = generateCsv(
      transformedData,
      fieldsToExport as (keyof (typeof transformedData)[0])[],
      fieldsToExport.map((f) => {
        // Human-readable headers
        const headerMap: Record<string, string> = {
          email: 'Email Address',
          subscribed: 'Subscribed',
          created_at: 'Created At',
        };
        return headerMap[f] || f;
      })
    );

    // ========================================
    // 7. AUDIT LOGGING
    // ========================================
    // Log to database for compliance
    const { error: logError } = await supabase.from('admin_export_logs').insert({
      admin_email: adminUser.email,
      admin_user_id: adminUser.id,
      export_type: 'subscribers',
      record_count: subscribers.length,
      fields_exported: fieldsToExport,
      ip_address: context.ip,
      user_agent: context.userAgent,
    });

    if (logError && process.env.NODE_ENV === 'development') {
      console.warn('Failed to log export to database:', logError);
    }

    // Log to security logger for real-time monitoring
    SecurityLog.dataExportSuccess(
      context,
      adminUser.email,
      'subscribers',
      subscribers.length
    );

    // ========================================
    // 8. STREAM CSV DOWNLOAD
    // ========================================
    const filename = createCsvFilename('subscribers-export', true);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        // Force file download (not display in browser)
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,

        // Security headers: Prevent caching of sensitive data
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        Pragma: 'no-cache',
        Expires: '0',

        // Additional security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    // Environment-aware error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Export API error:', error);
    } else {
      console.error(
        'Export API error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    SecurityLog.suspiciousRequest(context, 'Unexpected error in export endpoint');

    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Max-Age': '86400',
    },
  });
}
