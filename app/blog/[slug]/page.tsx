import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, createStaticClient } from '@/lib/supabase/server';
import CommentSection from '@/components/blog/CommentSection';
import { formatDate } from '@/lib/utils/format';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Enable ISR
export const revalidate = 60;

// Generate metadata dynamically
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!post) {
    return {
      title: 'Post Not Found | Emcogma',
    };
  }

  return {
    title: `${post.title} | Emcogma Blog`,
    description: post.excerpt,
  };
}

// Generate static params for all published posts
export async function generateStaticParams() {
  const supabase = createStaticClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true);

  if (!posts) return [];

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch post from Supabase
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !post) {
    notFound();
  }

  // Simple markdown parser
  const parseMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line: string) => {
        if (line.startsWith('# ')) {
          return `<h1 class="text-3xl font-bold font-mono neon-text mb-6 mt-8">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold font-mono text-cyber-primary mb-4 mt-6">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-xl font-bold font-mono text-cyber-secondary mb-3 mt-4">${line.substring(4)}</h3>`;
        }
        if (line.startsWith('```')) {
          return line.includes('```typescript') || line.includes('```javascript') || line.includes('```')
            ? '<pre class="bg-cyber-darker border border-cyber-primary/30 rounded-lg p-4 overflow-x-auto my-4"><code class="text-cyber-accent text-sm">'
            : '</code></pre>';
        }
        if (line.trim() === '') {
          return '<br />';
        }
        if (line.startsWith('- ')) {
          return `<li class="text-foreground/80 mb-2 ml-6">${line.substring(2)}</li>`;
        }
        return `<p class="text-foreground/80 mb-4">${line}</p>`;
      })
      .join('');
  };

  return (
    <div className="section-container">
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center text-cyber-primary hover:text-cyber-secondary transition-colors mb-8 font-mono"
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      {/* Article header */}
      <article className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="mb-4">
            <time className="text-cyber-primary/60 font-mono text-sm">
              {formatDate(post.created_at, 'long')}
            </time>
            <span className="mx-3 text-cyber-primary/30">•</span>
            <span className="text-foreground/60 text-sm">{post.read_time}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-6 neon-text">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags?.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-sm font-mono bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center font-mono font-bold text-cyber-dark mr-4">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-foreground">by {post.author}</div>
              <div className="text-sm text-foreground/60">Developer & Tech Enthusiast</div>
            </div>
          </div>
        </header>

        {/* Article content */}
        <div className="prose prose-invert prose-lg max-w-none mb-16">
          <div
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(post.content),
            }}
          />
        </div>

        {/* Share section */}
        <div className="border-t border-b border-cyber-primary/20 py-8 mb-12">
          <div className="flex items-center justify-between">
            <span className="font-mono text-foreground/60">Share this article:</span>
            <div className="flex gap-4">
              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="px-4 py-2 border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded font-mono text-sm"
              >
                Twitter
              </button>
              <button
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="px-4 py-2 border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded font-mono text-sm"
              >
                LinkedIn
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="px-4 py-2 border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded font-mono text-sm"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <CommentSection postSlug={slug} />
      </article>
    </div>
  );
}
