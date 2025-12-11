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
          <div key={demo.id} className="card-cyber group">
            <div className="mb-4">
              <h3 className="text-xl font-bold font-mono text-cyber-primary mb-2">{demo.title}</h3>
              <p className="text-foreground/70 text-sm mb-4">{demo.description}</p>

              {/* Demo preview/thumbnail */}
              <div className="relative bg-cyber-darker rounded-lg overflow-hidden aspect-video mb-4 border border-cyber-primary/20">
                {demo.thumbnail_url ? (
                  <img
                    src={demo.thumbnail_url}
                    alt={demo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyber-primary/30 border-t-cyber-primary rounded-full animate-spin"></div>
                      <p className="text-cyber-primary/60 font-mono text-sm">Demo Preview</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-2">
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
            </div>

            {demo.live_url && (
              <a
                href={demo.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-4 px-4 py-2 text-center font-mono text-sm text-cyber-primary border border-cyber-primary/30 hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300"
              >
                View Full Demo →
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
