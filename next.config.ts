import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    nodeMiddleware: true
  },
  async redirects() {
    return [
      {
        source: '/seo-generator',
        destination: '/dashboard/seo-generator',
        permanent: false,
      },
      {
        source: '/seo-generator/:path*',
        destination: '/dashboard/seo-generator/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
