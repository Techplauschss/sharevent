import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const phone = Buffer.from(token, 'base64').toString();
    
    const user = await prisma.user.findUnique({ 
      where: { phone } 
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        members: true
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = event.members.find(member => member.userId === user.id);
    
    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this event' },
        { status: 400 }
      );
    }

    // Add user as member
    await prisma.eventMember.create({
      data: {
        eventId: eventId,
        userId: user.id,
        role: 'member'
      }
    });

    return NextResponse.json({ message: 'Successfully joined the event' });
  } catch (error) {
    console.error('Error joining event:', error);
    return NextResponse.json(
      { error: 'Failed to join event' },
      { status: 500 }
    );
  }
}
