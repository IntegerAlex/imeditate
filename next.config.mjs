
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    optimizeCss: true,
  },
  metadata: {
    metadataBase: new URL('https://imeditate.gossorg.in'),
    alternates: {
      canonical: '/',
    },
  },
  images: {
    domains: ['images.unsplash.com'], // Add your image domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.gossorg.in',
      },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],
}

export default nextConfig