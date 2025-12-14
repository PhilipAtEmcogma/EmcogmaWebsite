import { NextRequest } from 'next/server';
import {
  performSecurityCheck,
  RATE_LIMITS,
  createSecureApiResponse,
  getRequestContext,
  SecurityLog,
  validateContactForm,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    // Security check: Strict rate limiting for contact form + body size validation
    const securityCheck = await performSecurityCheck(request, {
      rateLimit: RATE_LIMITS.contact,
      validateBody: true,
      maxBodySize: 10 * 1024, // 10KB max
    });

    if (!securityCheck.passed) {
      return securityCheck.response!;
    }

    const body = await request.json();
    const { name, email, message, recaptchaToken } = body;

    // Validate required fields
    if (!name || !email || !message) {
      SecurityLog.invalidInput(context, 'body', 'Missing required fields');
      return createSecureApiResponse(
        { error: 'Missing required fields' },
        400
      );
    }

    if (!recaptchaToken) {
      SecurityLog.invalidInput(context, 'recaptchaToken', 'Missing reCAPTCHA token');
      return createSecureApiResponse(
        { error: 'reCAPTCHA verification required' },
        400
      );
    }

    // Comprehensive input validation
    const validation = validateContactForm({ name, email, message });

    if (!validation.valid) {
      const errorMessage = Object.values(validation.errors)[0];
      SecurityLog.invalidInput(context, 'contact_form', errorMessage);
      return createSecureApiResponse(
        { error: errorMessage, errors: validation.errors },
        400
      );
    }

    // Verify reCAPTCHA token with Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not configured');
      return createSecureApiResponse(
        { error: 'Server configuration error' },
        500
      );
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    const recaptchaResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${recaptchaToken}`,
    });

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      SecurityLog.suspiciousRequest(context, 'reCAPTCHA verification failed');
      return createSecureApiResponse(
        { error: 'reCAPTCHA verification failed' },
        400
      );
    }

    // reCAPTCHA verified successfully, now submit to Formspree
    const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT;

    if (!formspreeEndpoint) {
      console.error('FORMSPREE_ENDPOINT is not configured');
      return createSecureApiResponse(
        { error: 'Server configuration error' },
        500
      );
    }

    const formspreeResponse = await fetch(formspreeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: validation.sanitized.name,
        email: validation.sanitized.email,
        message: validation.sanitized.message,
        _subject: `New Contact Form Submission from ${validation.sanitized.name}`,
      }),
    });

    if (!formspreeResponse.ok) {
      console.error('Formspree submission failed');
      return createSecureApiResponse(
        { error: 'Failed to send message' },
        500
      );
    }

    return createSecureApiResponse(
      {
        success: true,
        message: 'Message sent successfully!'
      },
      200
    );

  } catch (error) {
    console.error('Contact form error:', error);
    SecurityLog.suspiciousRequest(context, 'Unexpected error in POST /api/contact');
    return createSecureApiResponse(
      { error: 'Internal server error' },
      500
    );
  }
}
