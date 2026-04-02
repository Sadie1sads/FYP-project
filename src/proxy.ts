import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const publicPaths = ['/login', '/signup']

const protectedPaths = [
  '/home',
  '/profile',
  '/discover',
  '/inbox',
  '/createPosts',
  '/wishlists',
]

const adminPaths = ['/admin'] 

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))
  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p))
  const isAdminPath = adminPaths.some(p => pathname.startsWith(p))

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { isAdmin: boolean }

      if (!decoded.isAdmin) {
        return NextResponse.redirect(new URL('/home', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if ((isProtectedPath || isAdminPath) && token) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
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
    { source: '/admin/:path*' },    
    { source: '/admin' },          
    { source: '/login' },
    { source: '/signup' },
  ]
}