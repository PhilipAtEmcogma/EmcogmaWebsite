export default function LiveDemos() {
  const demos = [
    {
      title: 'AI Chat Assistant',
      description: 'Real-time AI-powered chat interface with natural language processing',
      embedUrl: 'https://example.com/demo1',
      tags: ['AI', 'React', 'WebSocket'],
    },
    {
      title: 'Data Visualization',
      description: 'Interactive charts and graphs with real-time data updates',
      embedUrl: 'https://example.com/demo2',
      tags: ['D3.js', 'Analytics', 'Real-time'],
    },
    {
      title: 'Code Editor',
      description: 'Browser-based code editor with syntax highlighting and live preview',
      embedUrl: 'https://example.com/demo3',
      tags: ['Monaco', 'TypeScript', 'Live Preview'],
    },
  ];

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
        {demos.map((demo, index) => (
          <div key={index} className="card-cyber group">
            <div className="mb-4">
              <h3 className="text-xl font-bold font-mono text-cyber-primary mb-2">
                {demo.title}
              </h3>
              <p className="text-foreground/70 text-sm mb-4">
                {demo.description}
              </p>

              {/* Demo preview placeholder */}
              <div className="relative bg-cyber-darker rounded-lg overflow-hidden aspect-video mb-4 border border-cyber-primary/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyber-primary/30 border-t-cyber-primary rounded-full animate-spin"></div>
                    <p className="text-cyber-primary/60 font-mono text-sm">Demo Placeholder</p>
                    <p className="text-foreground/40 text-xs mt-2">iframe: {demo.embedUrl}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {demo.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 text-xs font-mono bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 font-mono text-sm text-cyber-primary border border-cyber-primary/30 hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300">
              View Full Demo →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
