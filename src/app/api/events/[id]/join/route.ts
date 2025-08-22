import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const eventId = params.id;

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
    const existingMember = event.members.find(member => member.userId === session.user.id);
    
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
        userId: session.user.id,
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
