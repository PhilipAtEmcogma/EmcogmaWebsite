'use client';

import { useState, FormEvent } from 'react';
import ReCaptchaWrapper from './ReCaptchaWrapper';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setErrorMessage('Please complete the reCAPTCHA verification');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Send to our API route which verifies reCAPTCHA server-side
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setRecaptchaToken(null);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const isFormValid = formData.name && formData.email && formData.message && recaptchaToken;

  return (
    <div className="card-cyber p-8 md:p-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-cyber-primary">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-cyber w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-colors"
            placeholder="Your name"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-cyber-primary">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-cyber w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-colors"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2 text-cyber-primary">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="input-cyber w-full px-4 py-3 bg-cyber-darker border border-gray-700 rounded-lg focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-colors resize-none"
            placeholder="Tell us what's on your mind..."
          />
        </div>

        {/* reCAPTCHA */}
        <div>
          <ReCaptchaWrapper
            onVerify={handleRecaptchaChange}
            resetTrigger={submitStatus === 'success'}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="p-4 bg-cyber-accent/10 border border-cyber-accent rounded-lg">
            <p className="text-cyber-accent text-sm">
              ✓ Message sent successfully! We'll get back to you soon.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full btn-cyber px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
            isFormValid && !isSubmitting
              ? 'bg-gradient-to-r from-cyber-primary to-cyber-secondary hover:shadow-lg hover:shadow-cyber-primary/50'
              : 'bg-gray-700 cursor-not-allowed opacity-50'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>

        <p className="text-sm text-gray-500 text-center">
          * Required fields
        </p>
      </form>
    </div>
  );
}
