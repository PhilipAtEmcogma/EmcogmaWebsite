import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, createStaticClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';

interface DemoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Enable ISR
export const revalidate = 60;

// Generate metadata dynamically
export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();

  const { data: demo } = await supabase
    .from('demos')
    .select('title, description')
    .eq('slug', slug)
    .single();

  if (!demo) {
    return {
      title: 'Demo Not Found | Emcogma',
    };
  }

  return {
    title: `${demo.title} | Emcogma Demos`,
    description: demo.description,
  };
}

// Generate static params for all demos
export async function generateStaticParams() {
  const supabase = createStaticClient();

  const { data: demos } = await supabase
    .from('demos')
    .select('slug');

  if (!demos) return [];

  return demos.map((demo) => ({
    slug: demo.slug,
  }));
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch demo from Supabase
  const { data: demo, error } = await supabase
    .from('demos')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !demo) {
    notFound();
  }

  return (
    <div className="section-container">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center text-cyber-primary hover:text-cyber-secondary transition-colors mb-8 font-mono"
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      {/* Demo header */}
      <article className="max-w-4xl mx-auto">
        <header className="mb-12">
          {/* Category & Featured badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-mono bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded">
              {demo.category}
            </span>
            {demo.featured && (
              <span className="px-3 py-1 text-sm font-mono bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 rounded">
                ✨ Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-6 neon-text-green">
            {demo.title}
          </h1>

          <p className="text-xl text-foreground/80 mb-6">
            {demo.description}
          </p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {demo.tech?.map((tech: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-sm font-mono bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 rounded"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Demo links */}
          <div className="flex gap-4">
            {demo.live_url && (
              <a
                href={demo.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 font-mono bg-cyber-accent text-cyber-dark hover:bg-cyber-accent/90 transition-colors rounded"
              >
                🚀 View Live Demo
              </a>
            )}
            {demo.code_url && (
              <a
                href={demo.code_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 font-mono border border-cyber-primary/30 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded"
              >
                💻 View Code
              </a>
            )}
          </div>
        </header>

        {/* Demo thumbnail */}
        {demo.thumbnail_url && (
          <div className="mb-12 rounded-lg overflow-hidden border border-cyber-primary/20">
            <img
              src={demo.thumbnail_url}
              alt={demo.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-cyber-primary/20 pt-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-mono text-cyber-primary/60 mb-2">Created</h3>
              <p className="text-foreground">{formatDate(demo.created_at, 'long')}</p>
            </div>
            <div>
              <h3 className="text-sm font-mono text-cyber-primary/60 mb-2">Last Updated</h3>
              <p className="text-foreground">{formatDate(demo.updated_at, 'long')}</p>
            </div>
          </div>
        </div>
      </article>

      {/* CTA */}
      <div className="mt-20 text-center">
        <div className="card-cyber max-w-2xl mx-auto p-8">
          <h3 className="text-2xl font-bold font-mono neon-text mb-4">
            Like This Demo?
          </h3>
          <p className="text-foreground/80 mb-6">
            Check out more demos and projects, or get in touch to discuss collaboration.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="btn-cyber">
              View More Demos
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
