import Link from 'next/link';
import { createStaticClient } from '@/lib/supabase/server';
import type { Demo } from '@/lib/types';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LiveDemos() {
  const supabase = createStaticClient();

  // Fetch featured published demos from database
  const { data: demos } = await supabase
    .from('demos')
    .select('*')
    .eq('featured', true)
    .eq('published', true)
    .order('display_order', { ascending: true})
    .limit(3);

  // Empty state if no demos
  if (!demos || demos.length === 0) {
    return (
      <section className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold font-mono mb-4">
            <span className="neon-text-green">Live Demos</span>
          </h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Experience interactive demonstrations of my latest projects.
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="card-cyber p-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold neon-text-green mb-4">Coming Soon - Exciting Demos on the Way!</h3>
            <p className="text-foreground/60">
              Interactive demonstrations are being prepared. Check back soon to experience cutting-edge projects in
              action!
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
          <span className="neon-text-green">Live Demos</span>
        </h2>
        <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
          Experience interactive demonstrations of my latest projects. These live embeds showcase real functionality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {demos.map((demo: Demo, index) => (
          <div key={demo.id} className="card-cyber group h-full flex flex-col">
            {/* Thumbnail - clickable */}
            <Link href={`/demos/${demo.slug}`} className="relative bg-cyber-darker rounded-lg overflow-hidden aspect-video mb-4 border border-cyber-primary/20 block">
              {demo.thumbnail_url ? (
                <img
                  src={demo.thumbnail_url}
                  alt={demo.title}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyber-accent/20 to-cyber-primary/20 group-hover:from-cyber-accent/30 group-hover:to-cyber-primary/30 transition-all">
                  <span className="text-5xl font-mono text-cyber-accent/40 group-hover:text-cyber-accent/60 transition-colors">
                    {demo.title.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>
              )}
            </Link>

            {/* Category badge */}
            <div className="mb-3">
              <span className="px-2 py-1 text-xs font-mono bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded">
                {demo.category}
              </span>
            </div>

            {/* Title - clickable */}
            <Link href={`/demos/${demo.slug}`}>
              <h3 className="text-xl font-bold font-mono text-cyber-primary mb-2 group-hover:text-cyber-accent transition-colors cursor-pointer">
                {demo.title}
              </h3>
            </Link>

            <p className="text-foreground/70 text-sm mb-4 flex-grow">{demo.description}</p>

            {/* Tech Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {demo.tech &&
                demo.tech.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 text-xs font-mono bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 rounded"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3 pt-4 border-t border-cyber-primary/20">
              {/* View Details button - always shown */}
              <Link
                href={`/demos/${demo.slug}`}
                className="w-full px-4 py-2 text-center font-mono text-sm bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 hover:bg-cyber-accent hover:text-cyber-dark transition-all duration-300 rounded relative z-10"
              >
                View Details →
              </Link>

              {/* External link - only if live_url exists */}
              {demo.live_url && (
                <a
                  href={demo.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 text-center font-mono text-sm text-cyber-primary border border-cyber-primary/30 hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded relative z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  Live Demo →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
