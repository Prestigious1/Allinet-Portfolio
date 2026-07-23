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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://res.cloudinary.com https://avatars.githubusercontent.com",
              "font-src 'self' data:",
              "connect-src 'self' https://api.github.com wss://ws.pusherapp.com https://*.upstash.io",
              "frame-src 'self' https://www.youtube.com",
              "media-src 'self' blob: data:"
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
