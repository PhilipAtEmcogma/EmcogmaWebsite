import { createStaticClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Pricing() {
  const supabase = createStaticClient();

  // Fetch active products from database
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  // Map database products to plan format
  const plans =
    products && products.length > 0
      ? products.map((product: Product) => ({
          name: product.name,
          price: product.price ? `$${product.price}` : 'Custom',
          period: product.pricing_type === 'recurring' ? 'per month' : 'one-time',
          description: product.tagline,
          features: product.features || [],
          cta: product.featured ? 'Start Free Trial' : 'Get Started',
          highlighted: product.featured,
        }))
      : [];

  // Empty state if no products
  if (!plans || plans.length === 0) {
    return (
      <section className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold font-mono mb-4">
            <span className="neon-text-pink">Transparent Pricing</span>
          </h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include 14-day free trial.
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="card-cyber p-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold neon-text mb-4">Pricing Coming Soon</h3>
            <p className="text-foreground/60">
              We're finalizing our pricing plans. Check back soon for exciting options tailored to your
              needs!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-container">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold font-mono mb-4">
          <span className="neon-text-pink">Transparent Pricing</span>
        </h2>
        <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
          Choose the plan that fits your needs. All plans include 14-day free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-8 ${
              plan.highlighted
                ? 'bg-gradient-to-b from-cyber-primary/10 to-cyber-secondary/10 border-2 border-cyber-primary shadow-[0_0_30px_rgba(0,240,255,0.3)]'
                : 'card-cyber'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyber-primary text-cyber-dark font-mono text-sm font-bold rounded-full">
                Most Popular
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold font-mono text-cyber-primary mb-2">
                {plan.name}
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold neon-text">{plan.price}</span>
                <span className="text-foreground/60 ml-2">/ {plan.period}</span>
              </div>
              <p className="text-foreground/60 text-sm">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-cyber-accent mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-foreground/80 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 font-mono font-bold transition-all duration-300 ${
                plan.highlighted
                  ? 'btn-cyber'
                  : 'border-2 border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary hover:text-cyber-dark'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
