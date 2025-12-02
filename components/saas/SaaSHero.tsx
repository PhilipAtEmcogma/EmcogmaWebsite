export default function SaaSHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyber-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyber-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 section-container text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-4 py-2 bg-cyber-primary/10 border border-cyber-primary/30 rounded-full">
            <span className="text-cyber-primary font-mono text-sm">Beta Now Available</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-mono">
            <span className="gradient-text-green">Next-Gen Development Platform</span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto">
            Supercharge your workflow with AI-powered tools, real-time collaboration, and cyberpunk-inspired interfaces. Build faster, ship smarter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="btn-cyber">
              Start Free Trial
            </button>
            <button className="px-6 py-3 font-mono text-foreground/80 border-2 border-cyber-accent/50 hover:border-cyber-accent hover:text-cyber-accent transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Product screenshot placeholder */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-cyber-darker rounded-2xl overflow-hidden border-2 border-cyber-primary/30 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-cyber-primary/10 to-cyber-secondary/10">
                <div className="text-center">
                  <div className="text-6xl font-mono neon-text mb-4">[ DEMO ]</div>
                  <p className="text-foreground/60">Product Screenshot / Video Placeholder</p>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-cyber-primary/20 rounded-lg blur-xl animate-float"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyber-accent/20 rounded-lg blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
