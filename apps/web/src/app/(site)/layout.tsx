import type { Metadata, Viewport } from 'next'
import { Inter, Fira_Code, Orbitron } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { CommandHeader } from '@/components/site/CommandHeader'
import { generatePersonJsonLd, generateWebSiteJsonLd } from '@/lib/seo'
import './globals-site.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#07040d',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://allinet.dev'),
  title: {
    default: 'Ajibade Alli Akinkunmi — Senior Full-Stack & Systems Architect',
    template: '%s | ALLINET Command Center',
  },
  description:
    'Senior Full-Stack & Systems Architect specializing in Next.js, AI automation, deterministic state machines, and high-performance web systems.',
  authors: [{ name: 'Ajibade Alli Akinkunmi' }],
  creator: 'Ajibade Alli Akinkunmi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ALLINET Command Center',
    title: 'Ajibade Alli Akinkunmi — Senior Full-Stack & Systems Architect',
    description:
      'High-performance full-stack web applications, AI workflows, and enterprise architectures.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ajibade Alli Akinkunmi — Senior Full-Stack & Systems Architect',
    description:
      'High-performance full-stack web applications, AI workflows, and enterprise architectures.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const personJsonLd = generatePersonJsonLd()
  const websiteJsonLd = generateWebSiteJsonLd()

  return (
    <html
      lang="en"
      className={`${inter.variable} ${firaCode.variable} ${orbitron.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#07040d] text-slate-100 antialiased font-sans flex flex-col selection:bg-amber-400/20 selection:text-amber-200">
        <CommandHeader />
        <div className="flex-1 flex flex-col pt-16">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
