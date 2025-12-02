import Link from 'next/link';
import Hero from '@/components/home/Hero';
import LiveDemos from '@/components/home/LiveDemos';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import RecentPosts from '@/components/home/RecentPosts';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <LiveDemos />
      <FeaturedProjects />
      <RecentPosts />
      <CTASection />
    </>
  );
}
