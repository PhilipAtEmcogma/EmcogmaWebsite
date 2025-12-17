import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, createStaticClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Enable ISR
export const revalidate = 60;

// Generate metadata dynamically
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();

  const { data: project } = await supabase
    .from('projects')
    .select('title, description')
    .eq('slug', slug)
    .single();

  if (!project) {
    return {
      title: 'Project Not Found | Emcogma',
    };
  }

  return {
    title: `${project.title} | Emcogma Portfolio`,
    description: project.description,
  };
}

// Generate static params for all projects
export async function generateStaticParams() {
  const supabase = createStaticClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('slug');

  if (!projects) return [];

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch project from Supabase
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !project) {
    notFound();
  }

  return (
    <div className="section-container">
      {/* Back button */}
      <Link
        href="/portfolio"
        className="inline-flex items-center text-cyber-primary hover:text-cyber-secondary transition-colors mb-8 font-mono"
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Portfolio
      </Link>

      {/* Project header */}
      <article className="max-w-4xl mx-auto">
        <header className="mb-12">
          {/* Category & Featured badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-mono bg-cyber-secondary/10 text-cyber-secondary border border-cyber-secondary/30 rounded">
              {project.category}
            </span>
            {project.featured && (
              <span className="px-3 py-1 text-sm font-mono bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 rounded">
                ✨ Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-6 neon-text">
            {project.title}
          </h1>

          <p className="text-xl text-foreground/80 mb-6">
            {project.description}
          </p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tech?.map((tech: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-sm font-mono bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Project links */}
          <div className="flex gap-4">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 font-mono bg-cyber-primary text-cyber-dark hover:bg-cyber-primary/90 transition-colors rounded"
              >
                🚀 Live Demo
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 font-mono border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded"
              >
                💻 GitHub
              </a>
            )}
          </div>
        </header>

        {/* Project image */}
        {project.image_url && (
          <div className="mb-12 rounded-lg overflow-hidden border border-cyber-primary/20">
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Long description */}
        <div className="prose prose-invert prose-lg max-w-none mb-16">
          <h2 className="text-2xl font-bold font-mono text-cyber-primary mb-6">
            About This Project
          </h2>
          <div className="text-foreground/80 whitespace-pre-wrap">
            {project.long_description}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t border-cyber-primary/20 pt-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-mono text-cyber-primary/60 mb-2">Created</h3>
              <p className="text-foreground">{formatDate(project.created_at, 'long')}</p>
            </div>
            <div>
              <h3 className="text-sm font-mono text-cyber-primary/60 mb-2">Last Updated</h3>
              <p className="text-foreground">{formatDate(project.updated_at, 'long')}</p>
            </div>
          </div>
        </div>
      </article>

      {/* CTA */}
      <div className="mt-20 text-center">
        <div className="card-cyber max-w-2xl mx-auto p-8">
          <h3 className="text-2xl font-bold font-mono neon-text mb-4">
            Like This Project?
          </h3>
          <p className="text-foreground/80 mb-6">
            Check out more projects in my portfolio or get in touch to discuss collaboration.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/portfolio" className="btn-cyber">
              View All Projects
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 font-mono border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
