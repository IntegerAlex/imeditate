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
        // Remove or comment out this header to allow framing
        // {
        //   key: 'X-Frame-Options',
        //   value: 'DENY',
        // },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        // Alternatively, you could use Content-Security-Policy with frame-ancestors
        // to allow specific origins, e.g.:
        // {
        //   key: 'Content-Security-Policy',
        //   value: "frame-ancestors 'self' your-app-domain.com;",
        // },
      ],
    },
  ],
}

export default nextConfig
