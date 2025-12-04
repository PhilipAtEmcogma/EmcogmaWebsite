import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | EMCOGMA',
  description: 'Privacy policy for EMCOGMA - How we collect, use, and protect your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-cyber-dark py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-8 gradient-text">Privacy Policy</h1>

        <div className="prose prose-invert prose-cyan max-w-none">
          <p className="text-gray-300 text-lg mb-8">
            <strong>Last Updated:</strong> December 2025
          </p>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              EMCOGMA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">2. Information We Collect</h2>

            <h3 className="text-2xl font-semibold text-cyber-secondary mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li><strong>Contact Form:</strong> Name, email address, and message content</li>
              <li><strong>Comments:</strong> Name, optional email address, and comment content</li>
              <li><strong>Newsletter:</strong> Email address (if you subscribe)</li>
            </ul>

            <h3 className="text-2xl font-semibold text-cyber-secondary mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Log Data:</strong> IP address, browser type, pages visited, time spent on pages</li>
              <li><strong>Cookies:</strong> Session cookies for authentication (HTTP-only, secure)</li>
              <li><strong>Security Logs:</strong> Security events for monitoring and protection</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">We use the collected information to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Respond to your inquiries and provide customer support</li>
              <li>Display approved comments on blog posts</li>
              <li>Send newsletters (if you subscribed)</li>
              <li>Monitor and improve website security</li>
              <li>Analyze website usage and improve user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-300 mb-4">We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Encryption:</strong> All data transmitted over HTTPS (TLS 1.2+)</li>
              <li><strong>Database Security:</strong> Row-Level Security (RLS) policies via Supabase</li>
              <li><strong>Access Control:</strong> Database-driven admin whitelist with audit trails</li>
              <li><strong>Session Security:</strong> HTTP-only cookies, 10-minute timeout</li>
              <li><strong>Input Validation:</strong> Comprehensive sanitization to prevent XSS and injection attacks</li>
              <li><strong>Rate Limiting:</strong> Protection against brute force and DDoS attacks</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">5. Third-Party Services</h2>
            <p className="text-gray-300 mb-4">We use the following third-party services:</p>

            <div className="space-y-4">
              <div className="bg-cyber-darker p-4 rounded border border-cyber-primary/20">
                <h4 className="text-xl font-semibold text-cyber-secondary mb-2">Supabase</h4>
                <p className="text-gray-300">Database and authentication services. <a href="https://supabase.com/privacy" className="text-cyber-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
              </div>

              <div className="bg-cyber-darker p-4 rounded border border-cyber-primary/20">
                <h4 className="text-xl font-semibold text-cyber-secondary mb-2">Vercel</h4>
                <p className="text-gray-300">Hosting and deployment. <a href="https://vercel.com/legal/privacy-policy" className="text-cyber-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
              </div>

              <div className="bg-cyber-darker p-4 rounded border border-cyber-primary/20">
                <h4 className="text-xl font-semibold text-cyber-secondary mb-2">Google reCAPTCHA</h4>
                <p className="text-gray-300">Bot protection on forms. <a href="https://policies.google.com/privacy" className="text-cyber-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
              </div>

              <div className="bg-cyber-darker p-4 rounded border border-cyber-primary/20">
                <h4 className="text-xl font-semibold text-cyber-secondary mb-2">Formspree</h4>
                <p className="text-gray-300">Contact form email delivery. <a href="https://formspree.io/legal/privacy-policy" className="text-cyber-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">6. Your Rights (GDPR & CCPA)</h2>
            <p className="text-gray-300 mb-4">You have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your data</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-gray-300 mt-4">
              To exercise these rights, contact us at: <a href="mailto:emcogma@gmail.com" className="text-cyber-primary hover:underline">emcogma@gmail.com</a>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">7. Cookies</h2>
            <p className="text-gray-300 mb-4">We use the following types of cookies:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and security (HTTP-only)</li>
              <li><strong>Session Cookies:</strong> Temporary cookies deleted when you close your browser</li>
            </ul>
            <p className="text-gray-300 mt-4">
              We do <strong>not</strong> use tracking cookies or third-party advertising cookies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">8. Data Retention</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Comments:</strong> Retained indefinitely (can be deleted upon request)</li>
              <li><strong>Contact Submissions:</strong> Retained for 1 year</li>
              <li><strong>Security Logs:</strong> Retained for 90 days</li>
              <li><strong>Session Data:</strong> Deleted upon session expiry (10 minutes)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">9. Children's Privacy</h2>
            <p className="text-gray-300">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">10. International Data Transfers</h2>
            <p className="text-gray-300">
              Your data may be transferred to and processed in countries other than your country of residence. We ensure that such transfers comply with applicable data protection laws and that your data receives an adequate level of protection.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">12. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-cyber-darker p-6 rounded border border-cyber-primary/20">
              <p className="text-gray-300"><strong>Email:</strong> <a href="mailto:emcogma@gmail.com" className="text-cyber-primary hover:underline">emcogma@gmail.com</a></p>
              <p className="text-gray-300 mt-2"><strong>Response Time:</strong> Within 48 hours</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-cyber-primary mb-4">13. Security Incident Reporting</h2>
            <p className="text-gray-300">
              If you discover a security vulnerability or privacy concern, please report it responsibly to <a href="mailto:emcogma@gmail.com" className="text-cyber-primary hover:underline">emcogma@gmail.com</a>. We take all security reports seriously and will investigate promptly.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-cyber-primary/20">
            <p className="text-gray-400 text-sm">
              This Privacy Policy is compliant with GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act).
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
