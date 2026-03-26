import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/signup']

const protectedPaths = [
  '/home',
  '/profile',
  '/discover',
  '/inbox',
  '/createPosts',
  '/wishlists',
]

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))
  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p))

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    { source: '/home/:path*' },
    { source: '/profile/:path*' },
    { source: '/discover/:path*' },
    { source: '/inbox/:path*' },
    { source: '/createPosts/:path*' },
    { source: '/wishlists/:path*' },
    { source: '/login' },
    { source: '/signup' },
  ]
}