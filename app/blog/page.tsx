import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Blog - Emcogma',
  description: 'Articles, tutorials, and insights on web development, AI, and technology.',
};

// Enable ISR (Incremental Static Regeneration) - revalidate every 60 seconds
export const revalidate = 60;

export default async function BlogPage() {
  const supabase = await createClient();

  // Fetch published blog posts from Supabase
  const { data: blogPosts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
  }

  // If no posts found or error, show message
  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className="section-container">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-mono mb-6">
            <span className="gradient-text">Tech Blog</span>
          </h1>
          <p className="text-xl text-foreground/80 mb-8">
            No blog posts available yet. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold font-mono mb-6">
          <span className="gradient-text">Tech Blog</span>
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Thoughts, tutorials, and insights on modern web development, AI, and the future of technology.
        </p>
      </div>

      {/* Featured Post */}
      <Link href={`/blog/${blogPosts[0].slug}`} className="block mb-16 group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyber-primary/20 to-cyber-secondary/20 border-2 border-cyber-primary/30 p-8 md:p-12 hover:border-cyber-primary transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <span className="px-3 py-1 bg-cyber-primary/20 border border-cyber-primary/40 rounded-full text-cyber-primary text-sm font-mono">
              Featured
            </span>
            <time className="text-cyber-primary/60 text-sm font-mono">
              {new Date(blogPosts[0].created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4 neon-text group-hover:neon-text-pink transition-all">
            {blogPosts[0].title}
          </h2>

          <p className="text-lg text-foreground/80 mb-6">
            {blogPosts[0].excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {blogPosts[0].tags?.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-mono bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-foreground/60 text-sm">{blogPosts[0].read_time}</span>
          </div>
        </div>
      </Link>

      {/* All Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.slice(1).map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="group">
            <article className="card-cyber h-full flex flex-col">
              <div className="mb-4">
                <time className="text-cyber-primary/60 text-sm font-mono">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>

              <h2 className="text-xl font-bold font-mono text-foreground mb-3 group-hover:text-cyber-primary transition-colors">
                {post.title}
              </h2>

              <p className="text-foreground/70 text-sm mb-4 flex-grow">
                {post.excerpt}
              </p>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-mono bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">{post.read_time}</span>
                  <div className="flex items-center text-cyber-primary group-hover:text-cyber-secondary transition-colors font-mono">
                    Read More
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
