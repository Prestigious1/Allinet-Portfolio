import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://vercel.live",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://res.cloudinary.com https://avatars.githubusercontent.com https://*.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' blob: data: https://api.github.com wss://ws.pusherapp.com https://*.upstash.io https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://*.supabase.co",
              "frame-src 'self' https://www.youtube.com",
              "media-src 'self' blob: data: https://*.supabase.co"
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Kept strict. Voice input will need mic later if requested.
          },
        ],
      },
    ]
  },
}

// Ensure @next/bundle-analyzer is handled only if installed
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config: any) => config

export default withBundleAnalyzer(withPayload(nextConfig))
