import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export interface AuthenticatedUser {
  id: string;
  phone: string;
  name?: string;
}

/**
 * Authentifiziert einen Benutzer basierend auf dem Token im Cookie oder Authorization Header
 */
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Token aus Cookie oder Authorization Header holen
    let token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    // Token decodieren (Base64)
    const decodedPhone = Buffer.from(token, 'base64').toString('utf-8');
    
    if (!decodedPhone) {
      return null;
    }

    // Benutzer aus der Datenbank laden
    const user = await prisma.user.findUnique({
      where: { phone: decodedPhone },
      select: {
        id: true,
        phone: true,
        name: true,
      }
    });

    if (!user || !user.phone) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name || undefined,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Middleware-Hilfsfunktion um sicherzustellen, dass nur authentifizierte Benutzer zugreifen können
 */
export async function requireAuth(request: NextRequest): Promise<{ user: AuthenticatedUser } | { error: Response }> {
  const user = await authenticateUser(request);
  
  if (!user) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Nicht authentifiziert' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }

  return { user };
}
