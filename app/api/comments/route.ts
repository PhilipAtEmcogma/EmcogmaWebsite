import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  performSecurityCheck,
  RATE_LIMITS,
  createSecureApiResponse,
  getRequestContext,
  SecurityLog,
  validateSlug,
} from '@/lib/security';

// GET: Fetch approved comments for a blog post
export async function GET(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    // Security check: Rate limiting
    const securityCheck = await performSecurityCheck(request, {
      rateLimit: RATE_LIMITS.api,
    });

    if (!securityCheck.passed) {
      return securityCheck.response!;
    }

    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');

    if (!postSlug) {
      SecurityLog.invalidInput(context, 'postSlug', 'Missing post slug parameter');
      return createSecureApiResponse(
        { error: 'Post slug is required' },
        400
      );
    }

    // Validate slug format
    const slugValidation = validateSlug(postSlug);
    if (!slugValidation.valid) {
      SecurityLog.invalidInput(context, 'postSlug', slugValidation.error || 'Invalid slug');
      return createSecureApiResponse(
        { error: slugValidation.error || 'Invalid post slug' },
        400
      );
    }

    const supabase = await createClient();

    // Verify the blog post exists
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('slug', postSlug)
      .single();

    if (postError || !post) {
      return createSecureApiResponse(
        { error: 'Blog post not found' },
        404
      );
    }

    // Fetch approved comments for this post (using post_slug from schema)
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, author_name, content, created_at')
      .eq('post_slug', postSlug)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return createSecureApiResponse(
        { error: 'Failed to fetch comments' },
        500
      );
    }

    return createSecureApiResponse({ comments: comments || [] }, 200);
  } catch (error) {
    console.error('Comments API error:', error);
    SecurityLog.suspiciousRequest(context, 'Unexpected error in GET /api/comments');
    return createSecureApiResponse(
      { error: 'Internal server error' },
      500
    );
  }
}

// POST: Submit a new comment
export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    // Security check: Stricter rate limiting for POST + body size validation
    const securityCheck = await performSecurityCheck(request, {
      rateLimit: RATE_LIMITS.comments,
      validateBody: true,
      maxBodySize: 10 * 1024, // 10KB max
    });

    if (!securityCheck.passed) {
      return securityCheck.response!;
    }

    const body = await request.json();
    const { postSlug, author, authorEmail, content, recaptchaToken } = body;

    // Validate required fields
    if (!postSlug || !author || !content) {
      SecurityLog.invalidInput(context, 'body', 'Missing required fields');
      return createSecureApiResponse(
        { error: 'Missing required fields: postSlug, author, and content are required' },
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

    // Use comprehensive validation
    const { validateComment } = await import('@/lib/security');
    const validation = validateComment({
      author,
      authorEmail,
      content,
      postSlug,
    });

    if (!validation.valid) {
      const errorMessage = Object.values(validation.errors)[0];
      SecurityLog.invalidInput(context, 'comment', errorMessage);
      return createSecureApiResponse(
        { error: errorMessage, errors: validation.errors },
        400
      );
    }

    const supabase = await createClient();

    // Verify the blog post exists
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('slug', validation.sanitized.postSlug)
      .single();

    if (postError || !post) {
      return createSecureApiResponse(
        { error: 'Blog post not found' },
        404
      );
    }

    // Insert the comment (it will be pending approval by default)
    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        post_slug: validation.sanitized.postSlug,
        author_name: validation.sanitized.author,
        author_email: validation.sanitized.authorEmail || null,
        content: validation.sanitized.content,
        approved: false, // Requires admin approval
      });

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return createSecureApiResponse(
        { error: 'Failed to submit comment' },
        500
      );
    }

    return createSecureApiResponse(
      {
        success: true,
        message: 'Comment submitted successfully! It will appear after admin approval.',
      },
      200
    );
  } catch (error) {
    console.error('Comment submission error:', error);
    SecurityLog.suspiciousRequest(context, 'Unexpected error in POST /api/comments');
    return createSecureApiResponse(
      { error: 'Internal server error' },
      500
    );
  }
}
