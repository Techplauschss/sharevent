import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('Starting event creation...');
    const session = await auth();
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { name, description, date, location } = body;

    // Validate required fields
    if (!name || !date) {
      console.log('Missing required fields: name or date');
      return NextResponse.json(
        { error: 'Name and date are required' },
        { status: 400 }
      );
    }

    console.log('Creating event with data:', {
      name,
      description,
      date: new Date(date),
      location,
      creatorId: session.user.id
    });

    // Ensure user exists in database
    console.log('Ensuring user exists in database...');
    let user;
    
    try {
      // Find user by ID (should exist since we use phone authentication)
      user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (user) {
        // Update existing user data
        user = await prisma.user.update({
          where: { id: session.user.id },
          data: {
            name: session.user.name || null,
            image: session.user.image || null
          }
        });
        console.log('User updated:', user.id);
      } else {
        return NextResponse.json(
          { error: 'User not found in database. Please log in again.' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Error handling user:', error);
      return NextResponse.json(
        { error: 'Failed to handle user data' },
        { status: 500 }
      );
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        location,
        creatorId: user.id,
        members: {
          create: [
            // Add creator as admin
            {
              userId: user.id,
              role: 'admin'
            }
          ]
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                image: true
              }
            }
          }
        }
      }
    });

    console.log('Event created successfully:', event.id);

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : { message: 'Unknown error' };
    
    console.error('Error details:', errorDetails);
    return NextResponse.json(
      { error: 'Failed to create event', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the actual user ID from database
    let actualUserId = session.user.id;
    
    // Find user by session ID (should exist since we use phone authentication)
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user) {
      actualUserId = user.id;
    } else {
      return NextResponse.json(
        { error: 'User not found in database. Please log in again.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let whereClause = {};

    switch (filter) {
      case 'my-events':
        whereClause = {
          creatorId: actualUserId
        };
        break;
      case 'joined':
        whereClause = {
          members: {
            some: {
              userId: actualUserId
            }
          }
        };
        break;
      case 'upcoming':
        whereClause = {
          date: {
            gte: new Date()
          },
          members: {
            some: {
              userId: actualUserId
            }
          }
        };
        break;
      case 'past':
        whereClause = {
          date: {
            lt: new Date()
          },
          members: {
            some: {
              userId: actualUserId
            }
          }
        };
        break;
      default:
        // All events the user is a member of or created
        whereClause = {
          OR: [
            { creatorId: actualUserId },
            {
              members: {
                some: {
                  userId: actualUserId
                }
              }
            }
          ]
        };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
