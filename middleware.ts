import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Öffentliche Routen, die keine Authentifikation benötigen
  const publicRoutes = ['/auth/signin', '/api/auth', '/api/health', '/', '/favicon.ico']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // API-Routen sind öffentlich zugänglich (werden intern authentifiziert)
  const isApiRoute = pathname.startsWith('/api/')
  
  // Statische Assets und Next.js interne Routen
  const isStaticAsset = pathname.startsWith('/_next/') || 
                       pathname.startsWith('/public/') ||
                       pathname.includes('.')

  if (isPublicRoute || isApiRoute || isStaticAsset) {
    return NextResponse.next()
  }

  // Prüfe auf Authentifizierungstoken
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Token-Validierung (vereinfacht - nur prüfen ob es existiert)
  try {
    // Hier könnten wir das Token decodieren und validieren
    // Für jetzt reicht es zu prüfen, ob es existiert
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
}
