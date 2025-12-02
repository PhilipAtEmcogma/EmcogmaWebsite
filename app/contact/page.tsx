import { Metadata } from 'next';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Emcogma',
  description: 'Get in touch with us. Send us a message and we\'ll get back to you as soon as possible.',
  openGraph: {
    title: 'Contact Us | Emcogma',
    description: 'Get in touch with us. Send us a message and we\'ll get back to you as soon as possible.',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyber-darker via-cyber-dark to-cyber-darker py-20">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Get In Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have a question or want to work together? Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto">
          <ContactForm />
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="card-cyber p-6 text-center">
            <div className="text-cyber-primary text-3xl mb-4">📧</div>
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <p className="text-gray-400">We'll respond within 24 hours</p>
          </div>

          <div className="card-cyber p-6 text-center">
            <div className="text-cyber-secondary text-3xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Chat</h3>
            <p className="text-gray-400">Quick responses to your queries</p>
          </div>

          <div className="card-cyber p-6 text-center">
            <div className="text-cyber-accent text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Collaborate</h3>
            <p className="text-gray-400">Let's build something amazing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
