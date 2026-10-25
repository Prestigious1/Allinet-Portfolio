import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rewrite / to /os when HOME_MODE is 'os' (default)
  if (pathname === '/') {
    const homeMode = process.env.HOME_MODE || 'os'
    if (homeMode === 'os') {
      const url = request.nextUrl.clone()
      url.pathname = '/os'
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/...)
     * - admin routes (/admin/...)
     * - static files (_next/static, _next/image, favicon.ico)
     */
    '/((?!api|_next/static|_next/image|admin|favicon.ico).*)',
  ],
}
