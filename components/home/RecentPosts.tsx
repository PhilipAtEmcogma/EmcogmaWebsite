import Link from 'next/link';
import { createStaticClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function RecentPosts() {
  const supabase = createStaticClient();

  // Fetch 3 latest published blog posts from database
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  // Empty state if no posts
  if (!posts || posts.length === 0) {
    return (
      <section className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold font-mono mb-4">
            <span className="gradient-text">Recent Articles</span>
          </h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Thoughts, tutorials, and insights on modern web development and technology.
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="card-cyber p-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold gradient-text mb-4">
              New Content Dropping Soon - Stay Tuned!
            </h3>
            <p className="text-foreground/60">
              Fresh articles on cutting-edge technologies and development best practices are on the way.
              Check back soon for exciting new content!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-container">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold font-mono mb-4">
          <span className="gradient-text">Recent Articles</span>
        </h2>
        <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
          Thoughts, tutorials, and insights on modern web development and technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {posts.map((post: BlogPost) => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="group">
            <article className="card-cyber h-full flex flex-col">
              <div className="mb-4">
                <time className="text-cyber-primary/60 text-sm font-mono">
                  {formatDate(post.created_at, 'short')}
                </time>
              </div>

              <h3 className="text-xl font-bold font-mono text-foreground mb-3 group-hover:text-cyber-primary transition-colors">
                {post.title}
              </h3>

              <p className="text-foreground/70 text-sm mb-4 flex-grow">{post.excerpt}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags &&
                  post.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 text-xs font-mono bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>

              <div className="flex items-center text-cyber-primary group-hover:text-cyber-secondary transition-colors font-mono text-sm">
                Read More
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link href="/blog" className="btn-cyber">
          View All Articles
        </Link>
      </div>
    </section>
  );
}
