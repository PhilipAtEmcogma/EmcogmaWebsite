interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  category: string;
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <div className={`card-cyber group h-full flex flex-col ${featured ? 'lg:col-span-1' : ''}`}>
      {/* Project image placeholder */}
      <div className="relative bg-cyber-darker rounded-lg overflow-hidden mb-4 border border-cyber-primary/20 aspect-video">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/20 to-cyber-secondary/20 group-hover:from-cyber-primary/30 group-hover:to-cyber-secondary/30 transition-all duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-mono text-cyber-primary/40 group-hover:text-cyber-primary/60 transition-colors">
            {project.title.split(' ').map(word => word[0]).join('')}
          </span>
        </div>
        {project.featured && (
          <div className="absolute top-2 right-2 px-3 py-1 bg-cyber-primary/90 text-cyber-dark font-mono text-xs font-bold rounded">
            Featured
          </div>
        )}
      </div>

      {/* Category badge */}
      <div className="mb-3">
        <span className="px-2 py-1 text-xs font-mono bg-cyber-secondary/10 text-cyber-secondary border border-cyber-secondary/30 rounded">
          {project.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold font-mono text-cyber-primary mb-3 group-hover:text-cyber-secondary transition-colors">
        {project.title}
      </h3>

      {/* Description */}
      <p className="text-foreground/70 text-sm mb-4 flex-grow">
        {project.description}
      </p>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tech.map((tech, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs font-mono bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-3 pt-4 border-t border-cyber-primary/20">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 text-center font-mono text-sm text-cyber-primary border border-cyber-primary/30 hover:bg-cyber-primary hover:text-cyber-dark transition-all duration-300 rounded"
          >
            Live Demo
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 text-center font-mono text-sm text-foreground/80 border border-cyber-primary/30 hover:border-cyber-primary hover:text-cyber-primary transition-all duration-300 rounded"
          >
            GitHub
          </a>
        )}
      </div>
    </div>
  );
}
