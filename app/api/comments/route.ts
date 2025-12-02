import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch approved comments for a blog post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');

    if (!postSlug) {
      return NextResponse.json(
        { error: 'Post slug is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First, get the blog post ID from the slug
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', postSlug)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Fetch approved comments for this post
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, author, content, created_at')
      .eq('post_id', post.id)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] }, { status: 200 });
  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Submit a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postSlug, author, content } = body;

    // Validate required fields
    if (!postSlug || !author || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: postSlug, author, and content are required' },
        { status: 400 }
      );
    }

    // Basic validation
    if (author.trim().length < 2) {
      return NextResponse.json(
        { error: 'Author name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (content.trim().length < 5) {
      return NextResponse.json(
        { error: 'Comment must be at least 5 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the blog post ID from the slug
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', postSlug)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Insert the comment (it will be pending approval by default)
    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        author: author.trim(),
        content: content.trim(),
        approved: false, // Requires admin approval
      });

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit comment' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Comment submitted successfully! It will appear after admin approval.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Comment submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
