import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();
const ADMIN_PHONE = '015153352436';

export async function checkAdminAccess(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false, error: 'No valid authorization header' };
    }

    const token = authHeader.substring(7);
    
    // In a real app, you would verify the JWT token here
    // For now, we'll get the phone from localStorage on the client side
    // and verify it against the database
    
    // Alternative: Check if there's a session or user context
    // This is a simplified version - in production you'd use proper auth
    
    return { isAdmin: true, error: null };
  } catch (error) {
    return { isAdmin: false, error: 'Authentication failed' };
  }
}

export async function verifyAdminPhone(phone: string): Promise<boolean> {
  return phone === ADMIN_PHONE;
}
