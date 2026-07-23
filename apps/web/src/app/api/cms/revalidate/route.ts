import { revalidateTag } from 'next/cache'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

// Verify Strapi webhook signature
function verifyWebhookSignature(signature: string | null, body: string): boolean {
  if (!signature || !process.env.CMS_WEBHOOK_SECRET) return false
  
  // Signature is in the format: sha256=<hmac>
  const [, hash] = signature.split('=')
  if (!hash) return false

  const expectedHash = crypto
    .createHmac('sha256', process.env.CMS_WEBHOOK_SECRET)
    .update(body)
    .digest('base64') // Note: strapi usually uses base64 for webhook signatures, might need tweaking based on actual payload

  return hash === expectedHash
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('Strapi-Signature')
    const bodyText = await req.text()
    
    // Allow bypass in development if secret is not set, otherwise require it
    if (process.env.NODE_ENV === 'production' || process.env.CMS_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(signature, bodyText)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = JSON.parse(bodyText)
    const { model } = body

    // Map Strapi model to Next.js cache tags
    const tagMap: Record<string, string[]> = {
      'project':          ['projects', 'featured-projects'],
      'blog-post':        ['blog-posts'],
      'experience':       ['experiences', 'resume'],
      'portfolio-owner':  ['owner', 'resume'],
      'site-settings':    ['settings'],
      'world':            ['worlds'],
    }

    const tags = tagMap[model] ?? ['all']
    
    tags.forEach(tag => {
      // @ts-expect-error Next.js 14 revalidateTag signature mismatch in some TS configurations
      revalidateTag(tag)
      console.log(`[ISR] Revalidated tag: ${tag}`)
    })

    return NextResponse.json({ success: true, revalidated: tags })
  } catch (err: any) {
    console.error('[Webhook Error]:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
