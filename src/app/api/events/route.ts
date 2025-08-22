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
    const { name, description, date, location, memberEmails } = body;

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

    // Ensure user exists in database (especially for demo users)
    console.log('Ensuring user exists in database...');
    let user;
    
    try {
      // First try to find user by ID
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
        // Check if user with same email already exists
        const existingUserByEmail = session.user.email ? await prisma.user.findUnique({
          where: { email: session.user.email }
        }) : null;

        if (existingUserByEmail) {
          // Use the existing user instead of creating a new one
          user = existingUserByEmail;
          console.log('Using existing user with same email:', user.id);
          
          // Update session user ID to match the existing user
          // Note: This is a workaround for NextAuth ID inconsistencies
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              id: session.user.id,
              email: session.user.email || null,
              name: session.user.name || null,
              image: session.user.image || null
            }
          });
          console.log('User created:', user.id);
        }
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
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    console.log('Event created successfully:', event.id);

    // If member emails are provided, add them to the event
    if (memberEmails && Array.isArray(memberEmails) && memberEmails.length > 0) {
      // Find users by email
      const users = await prisma.user.findMany({
        where: {
          email: {
            in: memberEmails
          }
        }
      });

      // Add found users as members (excluding the creator)
      const membersToAdd = users.filter(u => u.id !== user.id);
      
      if (membersToAdd.length > 0) {
        await prisma.eventMember.createMany({
          data: membersToAdd.map(user => ({
            eventId: event.id,
            userId: user.id,
            role: 'member'
          })),
          skipDuplicates: true
        });
      }
    }

    // Fetch the complete event with updated members
    const completeEvent = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(completeEvent);
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

    // Get the actual user ID from database (same logic as in POST)
    let actualUserId = session.user.id;
    
    // First try to find user by session ID
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user && session.user.email) {
      // If not found by ID, try to find by email
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (user) {
        actualUserId = user.id;
        console.log('Using user ID from email lookup:', actualUserId);
      }
    }

    if (user) {
      actualUserId = user.id;
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
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
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
