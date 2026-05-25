import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /admin/dashboard
  if (pathname.startsWith('/admin/dashboard')) {
    const session = req.cookies.get('admin_session')?.value
    const secret = process.env.ADMIN_SESSION_SECRET || 'rmm_admin_secret'

    if (session !== secret) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
