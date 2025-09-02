/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress hydration warnings for browser extensions
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
  },
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "res.cloudinary.com" },
    ],
  },
  
  // HIPAA Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.accounts.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://clerk.accounts.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com; frame-src 'self' https://clerk.accounts.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com; worker-src 'self' blob:;"
          }
        ]
      }
    ];
  },

  // Force HTTPS in production
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/(.*)',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://:host/:path*',
          permanent: true,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
