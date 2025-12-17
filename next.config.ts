import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Security: Restrict image sources to trusted domains only
    remotePatterns: [
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
      // Common trusted CDNs (add your specific domains as needed)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      // Add your own domain if serving images from it
      // {
      //   protocol: 'https',
      //   hostname: 'yourdomain.com',
      // },
    ],
    // Additional security: Limit image sizes
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  // Turbopack configuration (Next.js 16 default)
  // Empty config to acknowledge webpack config migration
  turbopack: {},
  // Security headers (backup - primary headers in middleware)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  // Webpack configuration for Edge Runtime compatibility
  webpack: (config, { isServer }) => {
    // Edge Runtime doesn't support Node.js crypto module
    // Use Web Crypto API instead (already implemented in lib/security/csp.ts)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
