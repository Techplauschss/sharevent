import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found in database. Please log in again.' }, { status: 401 });
    }
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
    const { name, description, date, location } = body;

    // Validate required fields
    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        location,
        creatorId: user.id,
        members: {
          create: {
            userId: user.id
          }
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
