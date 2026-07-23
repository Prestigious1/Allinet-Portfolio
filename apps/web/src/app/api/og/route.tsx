import { ImageResponse } from '@vercel/og'
import { NextResponse } from 'next/server'
import { services } from '@/core/providers'
import { withApiMiddleware } from '@/core/api/middleware'

export const runtime = 'edge'

// Wrap in withApiMiddleware for rate limiting, but return ImageResponse.
// withApiMiddleware supports returning raw Response objects.
export const GET = withApiMiddleware(
  { rateLimitKey: 'api:og', rateLimitConfig: { limit: 30, windowMs: 60000 } },
  async (req: Request) => {
    try {
      const { searchParams } = new URL(req.url)
      const type = searchParams.get('type') || 'home'
      const title = searchParams.get('title') || ''
      const description = searchParams.get('desc') || ''
      
      // Fetch dynamic portfolio branding from the CMS abstraction
      const settings = await services.portfolio.getSiteSettings()
      
      const siteName = settings.siteName || 'ALLINET OS'
      const themeColor = settings.defaultTheme === 'cyber-gold' ? '#D4AF37' : '#9333EA'

      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              backgroundColor: '#050014', // Deep cyber background
              padding: '80px',
              borderLeft: `12px solid ${themeColor}`,
            }}
          >
            {/* Dynamic Logo/Site Name */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: themeColor,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#000',
                }}
              >
                {settings.logoText || 'A'}
              </div>
              <span style={{ fontSize: '32px', color: '#fff', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                {siteName}
              </span>
            </div>

            {/* Dynamic Content based on Type */}
            <div
              style={{
                display: 'flex',
                fontSize: '24px',
                color: themeColor,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '20px',
              }}
            >
              {type === 'blog' ? '📝 ENGINEERING BLOG' :
               type === 'project' ? '🚀 FEATURED PROJECT' :
               type === 'certificate' ? '🏆 ACHIEVEMENT' :
               '🌐 INTERACTIVE PORTFOLIO'}
            </div>

            <h1
              style={{
                fontSize: title.length > 40 ? '60px' : '80px',
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.1,
                marginBottom: '30px',
                maxWidth: '900px',
              }}
            >
              {title || 'Experience the Web in 3D'}
            </h1>

            {description && (
              <p
                style={{
                  fontSize: '32px',
                  color: '#a1a1aa',
                  lineHeight: 1.4,
                  maxWidth: '800px',
                }}
              >
                {description.length > 120 ? description.substring(0, 120) + '...' : description}
              </p>
            )}

            {/* Decorative OS elements */}
            <div style={{ display: 'flex', marginTop: 'auto', gap: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      )
    } catch (e: any) {
      console.error('[OG Image Error]', e)
      return NextResponse.json({ error: 'Failed to generate OG image' }, { status: 500 })
    }
  }
)
