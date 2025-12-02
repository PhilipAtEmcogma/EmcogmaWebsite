import type { Metadata } from 'next';
import SaaSHero from '@/components/saas/SaaSHero';
import Features from '@/components/saas/Features';
import Pricing from '@/components/saas/Pricing';
import Testimonials from '@/components/saas/Testimonials';
import FAQ from '@/components/saas/FAQ';
import SubscribeForm from '@/components/saas/SubscribeForm';

export const metadata: Metadata = {
  title: 'Product - Emcogma',
  description: 'Discover our cutting-edge SaaS solution designed for the future of development.',
};

export default function SaaSPage() {
  return (
    <>
      <SaaSHero />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <SubscribeForm />
    </>
  );
}
