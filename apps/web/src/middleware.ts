import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
  const isPublic = pathname.includes('/_next') || pathname.includes('/api')

  if (isPublic) return NextResponse.next()

  const response = intlMiddleware(request)

  if (!token && !isAuthPage) {
    const locale = pathname.split('/')[1] || defaultLocale
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  if (token && isAuthPage) {
    const locale = pathname.split('/')[1] || defaultLocale
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
