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
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Extract and decode token
    const token = authHeader.substring(7);
    const phone = Buffer.from(token, 'base64').toString();

    // Find the requesting user
    const requestingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (!requestingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if requesting user is the creator
    if (event.creatorId !== requestingUser.id) {
      return NextResponse.json(
        { error: 'Only the event creator can remove members' },
        { status: 403 }
      );
    }

    // Get the userId from request body
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent creator from removing themselves
    if (userId === event.creatorId) {
      return NextResponse.json(
        { error: 'Creator cannot be removed from the event' },
        { status: 400 }
      );
    }

    // Check if the user is actually a member
    const membership = await prisma.eventMember.findFirst({
      where: {
        eventId: eventId,
        userId: userId
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this event' },
        { status: 400 }
      );
    }

    // Remove the member
    await prisma.eventMember.delete({
      where: {
        id: membership.id
      }
    });

    return NextResponse.json(
      { message: 'Member removed successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
