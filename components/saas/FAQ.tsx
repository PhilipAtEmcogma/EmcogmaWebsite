'use client';

import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'You get full access to all Pro features for 14 days. No credit card required. After the trial, you can choose to upgrade or continue with the free Starter plan.',
    },
    {
      question: 'Can I change plans later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any credits.',
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'Starter users get community support through our Discord. Pro users get priority email support. Enterprise customers get dedicated support with SLA guarantees.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. We use bank-level encryption, are SOC 2 compliant, and never train our AI models on your private code. Your data is yours.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, we\'ll refund you in full, no questions asked.',
    },
  ];

  return (
    <section className="section-container">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold font-mono mb-4">
          <span className="neon-text-green">Frequently Asked Questions</span>
        </h2>
        <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
          Got questions? We have answers.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-cyber-primary/30 rounded-lg overflow-hidden bg-cyber-light/20"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-cyber-primary/5 transition-colors"
            >
              <span className="font-mono font-bold text-cyber-primary">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-cyber-primary transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 border-t border-cyber-primary/20 bg-cyber-dark/50">
                <p className="text-foreground/80">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
