import type { Metadata } from 'next';
import ProjectCard from '@/components/portfolio/ProjectCard';
import ProjectFilter from '@/components/portfolio/ProjectFilter';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Portfolio - Emcogma',
  description: 'Showcase of projects, experiments, and innovations in web development and technology.',
};

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export default async function PortfolioPage() {
  const supabase = await createClient();

  // Fetch projects from Supabase
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  // Handle error or empty state
  if (error) {
    console.error('Error fetching projects:', error);
  }

  const projectList = projects || [];
  const categories = ['All', ...Array.from(new Set(projectList.map(p => p.category)))];

  return (
    <div className="section-container">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold font-mono mb-6">
          <span className="neon-text-pink">Project Portfolio</span>
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          A collection of projects showcasing innovation, technical excellence, and creative problem-solving.
        </p>
      </div>

      {/* Filter */}
      <ProjectFilter categories={categories} />

      {/* Featured Projects */}
      {projectList.filter(p => p.featured).length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold font-mono mb-8">
            <span className="gradient-text">Featured Projects</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projectList
              .filter(p => p.featured)
              .map((project) => (
                <ProjectCard key={project.id} project={project} featured />
              ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold font-mono mb-8">
          <span className="neon-text-green">All Projects</span>
        </h2>
        {projectList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectList.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">No projects available yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-20 text-center">
        <div className="card-cyber max-w-2xl mx-auto p-8">
          <h3 className="text-2xl font-bold font-mono neon-text mb-4">
            Interested in Collaboration?
          </h3>
          <p className="text-foreground/80 mb-6">
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </p>
          <a href="mailto:hello@emcogma.com" className="btn-cyber">
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
