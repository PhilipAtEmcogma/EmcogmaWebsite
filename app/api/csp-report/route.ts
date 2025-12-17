/**
 * CSP Violation Reporting Endpoint
 * Receives and logs Content Security Policy violations
 */

import { NextRequest, NextResponse } from 'next/server';
import { securityMonitor } from '@/lib/security/monitoring';
import { getClientIP } from '@/lib/supabase/ip';

interface CSPViolation {
  'csp-report': {
    'document-uri': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'blocked-uri': string;
    'source-file'?: string;
    'line-number'?: number;
    'column-number'?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const violation: CSPViolation = await request.json();
    const report = violation['csp-report'];

    if (!report) {
      return NextResponse.json({ error: 'Invalid CSP report format' }, { status: 400 });
    }

    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log CSP violation to monitoring service
    await securityMonitor.reportEvent(
      'csp_violation',
      `CSP Violation: ${report['violated-directive']} blocked ${report['blocked-uri']}`,
      'warning',
      {
        ip,
        userAgent,
        path: report['document-uri'],
        metadata: {
          violatedDirective: report['violated-directive'],
          effectiveDirective: report['effective-directive'],
          blockedUri: report['blocked-uri'],
          sourceFile: report['source-file'],
          lineNumber: report['line-number'],
          columnNumber: report['column-number'],
        },
      }
    );

    // Check if this is a potential XSS attack
    const suspiciousPatterns = [
      'data:',
      'javascript:',
      'eval',
      'inline',
      'unsafe-eval',
      'unsafe-inline',
    ];

    const isSuspicious = suspiciousPatterns.some(
      (pattern) =>
        report['blocked-uri'].includes(pattern) ||
        report['violated-directive'].includes(pattern)
    );

    if (isSuspicious) {
      await securityMonitor.reportEvent(
        'potential_xss_attempt',
        `Potential XSS attempt blocked by CSP: ${report['blocked-uri']}`,
        'error',
        {
          ip,
          userAgent,
          path: report['document-uri'],
          metadata: {
            blockedUri: report['blocked-uri'],
            violatedDirective: report['violated-directive'],
          },
        }
      );
    }

    return NextResponse.json({ received: true }, { status: 204 });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return NextResponse.json(
      { error: 'Failed to process CSP report' },
      { status: 500 }
    );
  }
}

// Accept both POST and OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
