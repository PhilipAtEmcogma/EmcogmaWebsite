import Link from 'next/link';

export default function RecentPosts() {
  const posts = [
    {
      title: 'Building Scalable Next.js Applications',
      excerpt: 'Learn best practices for architecting large-scale Next.js apps with performance in mind.',
      date: '2025-11-28',
      tags: ['Next.js', 'Performance', 'Architecture'],
      slug: 'building-scalable-nextjs-apps',
    },
    {
      title: 'The Future of AI in Web Development',
      excerpt: 'Exploring how AI and machine learning are revolutionizing the way we build web applications.',
      date: '2025-11-25',
      tags: ['AI', 'Web Development', 'Future Tech'],
      slug: 'future-of-ai-web-dev',
    },
    {
      title: 'Cyberpunk Design Systems',
      excerpt: 'Creating immersive, futuristic user interfaces while maintaining usability and accessibility.',
      date: '2025-11-20',
      tags: ['Design', 'UI/UX', 'Cyberpunk'],
      slug: 'cyberpunk-design-systems',
    },
  ];

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
        {posts.map((post, index) => (
          <Link href={`/blog/${post.slug}`} key={index} className="group">
            <article className="card-cyber h-full flex flex-col">
              <div className="mb-4">
                <time className="text-cyber-primary/60 text-sm font-mono">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>

              <h3 className="text-xl font-bold font-mono text-foreground mb-3 group-hover:text-cyber-primary transition-colors">
                {post.title}
              </h3>

              <p className="text-foreground/70 text-sm mb-4 flex-grow">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, tagIndex) => (
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
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
