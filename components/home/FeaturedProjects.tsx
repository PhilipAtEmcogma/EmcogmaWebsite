import Link from 'next/link';

export default function FeaturedProjects() {
  const projects = [
    {
      title: 'Cyberpunk Dashboard',
      description: 'A futuristic admin dashboard with real-time analytics and AI-powered insights.',
      tech: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind'],
      image: '/projects/dashboard.jpg',
      link: '/portfolio#dashboard',
    },
    {
      title: 'Neural Network Visualizer',
      description: 'Interactive tool for visualizing and understanding deep learning architectures.',
      tech: ['React', 'TensorFlow.js', 'D3.js', 'WebGL'],
      image: '/projects/neural.jpg',
      link: '/portfolio#neural',
    },
    {
      title: 'Quantum Code Editor',
      description: 'Next-generation code editor with AI-assisted completions and quantum algorithms.',
      tech: ['Monaco', 'AI/ML', 'Rust', 'WASM'],
      image: '/projects/editor.jpg',
      link: '/portfolio#editor',
    },
  ];

  return (
    <section className="section-container bg-cyber-light/5">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold font-mono mb-4">
          <span className="neon-text-pink">Featured Projects</span>
        </h2>
        <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
          A curated selection of my most ambitious and innovative projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <Link href={project.link} key={index} className="group">
            <div className="card-cyber h-full flex flex-col">
              {/* Project image placeholder */}
              <div className="relative bg-cyber-darker rounded-lg overflow-hidden aspect-video mb-4 border border-cyber-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/20 to-cyber-secondary/20 group-hover:from-cyber-primary/30 group-hover:to-cyber-secondary/30 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-mono text-cyber-primary/40 group-hover:text-cyber-primary/60 transition-colors">
                    {project.title.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold font-mono text-cyber-primary mb-2 group-hover:text-cyber-secondary transition-colors">
                {project.title}
              </h3>

              <p className="text-foreground/70 text-sm mb-4 flex-grow">
                {project.description}
              </p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 text-xs font-mono bg-cyber-secondary/10 text-cyber-secondary border border-cyber-secondary/30 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center text-cyber-primary group-hover:text-cyber-secondary transition-colors font-mono text-sm">
                View Project
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/portfolio" className="btn-cyber">
          View All Projects
        </Link>
      </div>
    </section>
  );
}
