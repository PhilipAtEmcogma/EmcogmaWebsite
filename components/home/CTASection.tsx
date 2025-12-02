import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="section-container">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyber-primary/10 via-cyber-secondary/10 to-cyber-accent/10 border border-cyber-primary/30 p-12 md:p-16">
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyber-secondary/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold font-mono mb-6">
            <span className="neon-text">Ready to Collaborate?</span>
          </h2>

          <p className="text-xl text-foreground/80 mb-8">
            Whether you need a cutting-edge SaaS solution, want to discuss technology, or explore partnership opportunities, let&apos;s connect.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/saas" className="btn-cyber">
              Explore Our Product
            </Link>
            <a
              href="mailto:hello@emcogma.com"
              className="px-6 py-3 font-mono text-foreground/80 border-2 border-cyber-accent/50 hover:border-cyber-accent hover:text-cyber-accent transition-all duration-300"
            >
              Get in Touch
            </a>
          </div>

          {/* Stats or highlights */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-cyber-primary/20">
            <div>
              <div className="text-3xl md:text-4xl font-bold font-mono neon-text mb-2">50+</div>
              <div className="text-foreground/60 text-sm">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold font-mono neon-text-pink mb-2">100k+</div>
              <div className="text-foreground/60 text-sm">Lines of Code</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold font-mono neon-text-green mb-2">5+</div>
              <div className="text-foreground/60 text-sm">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
