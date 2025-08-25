
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    
    const currentUser = await prisma.user.findUnique({ 
      where: { phone } 
    });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    // Check if current user has permission to add members to this event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        members: {
          where: { userId: currentUser.id }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is creator or member
    const isCreator = event.creatorId === currentUser.id;
    const isMember = event.members.length > 0;

    if (!isCreator && !isMember) {
      return NextResponse.json(
        { error: 'You must be a member of this event to add others' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phone: newMemberPhone } = body;

    if (!newMemberPhone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Find or create user by phone
    let user = await prisma.user.findUnique({ where: { phone: newMemberPhone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone: newMemberPhone } });
    }

    // Check if user is already a member
    const existingMember = await prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this event' }, { status: 400 });
    }

    // Add user as member to event
    const member = await prisma.eventMember.create({
      data: {
        eventId,
        userId: user.id,
        role: 'member',
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}
