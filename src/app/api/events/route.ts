import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult) {
      return authResult.error;
    }
    
    const { user } = authResult;

    const actualUserId = user.id;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    let whereClause: any = {};
    switch (filter) {
      case 'my-events':
        whereClause = { creatorId: actualUserId };
        break;
      case 'joined':
        whereClause = { members: { some: { userId: actualUserId } } };
        break;
      case 'upcoming':
        whereClause = { date: { gte: new Date() }, members: { some: { userId: actualUserId } } };
        break;
      case 'past':
        whereClause = { date: { lt: new Date() }, members: { some: { userId: actualUserId } } };
        break;
      default:
        whereClause = {
          OR: [
            { creatorId: actualUserId },
            { members: { some: { userId: actualUserId } } }
          ]
        };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        creator: { select: { id: true, name: true, phone: true, image: true } },
        members: { include: { user: { select: { id: true, name: true, phone: true, image: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Decode phone number from token (base64)
    let phone: string;
    try {
      phone = atob(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, date, location, invitedUsers = [] } = body;

    // Validate required fields
    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
    }

    // Find or create invited users
    const invitedUserIds: string[] = [];
    if (invitedUsers && Array.isArray(invitedUsers)) {
      for (const phone of invitedUsers) {
        if (phone && phone.trim()) {
          let invitedUser = await prisma.user.findUnique({ where: { phone: phone.trim() } });
          if (!invitedUser) {
            // Create user if not exists
            invitedUser = await prisma.user.create({ 
              data: { 
                phone: phone.trim(),
                name: null // Will be set when user signs up
              } 
            });
          }
          if (invitedUser.id !== user.id) { // Don't add creator as invited user
            invitedUserIds.push(invitedUser.id);
          }
        }
      }
    }

    // Create event with members
    const memberData = [
      { userId: user.id }, // Creator is always a member
      ...invitedUserIds.map(userId => ({ userId })) // Add invited users
    ];

    // Create event
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        location,
        creatorId: user.id,
        members: {
          create: memberData
        }
      },
      include: {
        creator: { select: { id: true, name: true, phone: true, image: true } },
        members: { include: { user: { select: { id: true, name: true, phone: true, image: true } } } }
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
