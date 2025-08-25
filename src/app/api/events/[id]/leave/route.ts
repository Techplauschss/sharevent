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

    // Check if user is the creator
    if (event.creatorId === user.id) {
      return NextResponse.json(
        { error: 'Event creators cannot leave their own events' },
        { status: 400 }
      );
    }

    // Check if user is a member
    const existingMember = event.members.find(member => member.userId === user.id);
    
    if (!existingMember) {
      return NextResponse.json(
        { error: 'You are not a member of this event' },
        { status: 400 }
      );
    }

    // Remove user from event
    await prisma.eventMember.delete({
      where: {
        id: existingMember.id
      }
    });

    return NextResponse.json({ message: 'Successfully left the event' });
  } catch (error) {
    console.error('Error leaving event:', error);
    return NextResponse.json(
      { error: 'Failed to leave event' },
      { status: 500 }
    );
  }
}
