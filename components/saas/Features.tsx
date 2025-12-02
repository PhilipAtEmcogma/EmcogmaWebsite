export default function Features() {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Assistance',
      description: 'Intelligent code completions, bug detection, and automated refactoring powered by advanced AI models.',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Optimized performance with millisecond response times and real-time synchronization.',
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SOC 2 compliance, and advanced security features to protect your data.',
    },
    {
      icon: '🌐',
      title: 'Real-Time Collaboration',
      description: 'Work together seamlessly with your team with live cursors, comments, and instant updates.',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into your codebase, team productivity, and project health.',
    },
    {
      icon: '🎨',
      title: 'Customizable UI',
      description: 'Fully themeable interface with cyberpunk aesthetics and personalization options.',
    },
  ];

  return (
    <section className="section-container bg-cyber-light/5">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold font-mono mb-4">
          <span className="neon-text">Powerful Features</span>
        </h2>
        <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
          Everything you need to build, deploy, and scale your applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="card-cyber group">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold font-mono text-cyber-primary mb-3 group-hover:text-cyber-secondary transition-colors">
              {feature.title}
            </h3>
            <p className="text-foreground/70">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
