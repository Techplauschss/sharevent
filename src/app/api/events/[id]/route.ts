import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromR2 } from '@/lib/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Token fehlt" }, { status: 401 })
    }

    const phone = Buffer.from(token, "base64").toString()
    const user = await prisma.user.findUnique({ where: { phone } })
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Kein Nutzer gefunden" }, { status: 404 })
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
        },
        photos: {
          select: {
            id: true,
            url: true,
            r2Key: true,
            thumbnail_url: true,
            thumbnail_r2_key: true,
            createdAt: true,
            filename: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ success: false, message: "Event nicht gefunden" }, { status: 404 })
    }

    // Check if user has access to this event
    const isCreator = event.creatorId === user.id
    const isMember = event.members?.some((member: any) => member.userId === user.id)

    if (!isCreator && !isMember) {
      return NextResponse.json({ success: false, message: "Keine Berechtigung für dieses Event" }, { status: 403 })
    }

    return NextResponse.json({ success: true, event, isCreator, isMember }, { status: 200 })
  } catch (error) {
    console.error("Fehler beim Laden des Events:", error)
    return NextResponse.json({ success: false, message: "Serverfehler" }, { status: 500 })
  }
}

export async function DELETE(
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

        // Get the event and verify membership/ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: true,
        photos: true,
        members: {
          include: {
            user: true
          }
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is the creator or a member of the event
    const isCreator = event.creatorId === user.id;
    const isMember = event.members.some(member => member.userId === user.id);

    // Allow deletion if user is creator OR member (by ID)
    if (!isCreator && !isMember) {
      return NextResponse.json({ 
        error: 'Only event members can delete this event',
        debug: {
          isCreator,
          isMember,
          userId: user.id,
          eventCreatorId: event.creatorId
        }
      }, { status: 403 });
    }

    // Delete all photos from R2 storage
    if (event.photos.length > 0) {
      console.log(`Deleting ${event.photos.length} photos from R2...`);
      
      for (const photo of event.photos) {
        try {
          // Delete the main photo using the stored r2Key
          if (photo.r2Key) {
            const deleted = await deleteFromR2(photo.r2Key);
            if (deleted) {
              console.log(`Deleted photo from R2: ${photo.r2Key}`);
            } else {
              console.error(`Failed to delete photo from R2: ${photo.r2Key}`);
            }
          }

          // Delete thumbnail if it exists
          if (photo.thumbnail_r2_key) {
            const thumbnailDeleted = await deleteFromR2(photo.thumbnail_r2_key);
            if (thumbnailDeleted) {
              console.log(`Deleted thumbnail from R2: ${photo.thumbnail_r2_key}`);
            } else {
              console.error(`Failed to delete thumbnail from R2: ${photo.thumbnail_r2_key}`);
            }
          }
        } catch (error) {
          console.error(`Failed to delete photo from R2: ${photo.r2Key}`, error);
          // Continue with other photos even if one fails
        }
      }
    }

    // Delete the event from database (this will cascade delete photos, members, etc.)
    await prisma.event.delete({
      where: { id: eventId },
    });

    console.log(`Event ${eventId} and all associated data deleted successfully`);

    return NextResponse.json({ 
      success: true, 
      message: 'Event deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
