export default function Testimonials() {
  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Senior Developer at TechCorp',
      avatar: 'AC',
      content: 'This platform has revolutionized our development workflow. The AI assistance is incredible and saves us hours every day.',
    },
    {
      name: 'Sarah Williams',
      role: 'CTO at StartupXYZ',
      avatar: 'SW',
      content: 'The real-time collaboration features are game-changing. Our distributed team feels more connected than ever.',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Freelance Developer',
      avatar: 'MR',
      content: 'As a solo developer, the AI-powered tools make me feel like I have a whole team backing me up. Absolutely worth it.',
    },
  ];

  return (
    <section className="section-container bg-cyber-light/5">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold font-mono mb-4">
          <span className="gradient-text">Loved by Developers</span>
        </h2>
        <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
          See what our users have to say about their experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="card-cyber">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center font-mono font-bold text-cyber-dark mr-4">
                {testimonial.avatar}
              </div>
              <div>
                <div className="font-bold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-foreground/60">{testimonial.role}</div>
              </div>
            </div>
            <p className="text-foreground/80 italic">
              &quot;{testimonial.content}&quot;
            </p>
            <div className="mt-4 flex text-cyber-accent">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
