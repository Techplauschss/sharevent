import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Öffentliche Routen, die keine Authentifikation benötigen
  const publicRoutes = ['/auth/signin', '/auth/signup', '/', '/api/auth']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Wenn nicht eingeloggt und versucht private Route zu besuchen
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
}
