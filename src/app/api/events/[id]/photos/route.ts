import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@/generated/prisma';
import { uploadToR2, generatePhotoKey } from '@/lib/r2';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the actual user ID from database (same logic as in other routes)
    let actualUserId = session.user.id;
    
    try {
      // Find user by session ID only
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });
      if (user) {
        actualUserId = user.id;
      }
    } catch (error) {
      console.error('Error resolving user ID:', error);
    }

    const { id: eventId } = await params;

    // Check if event exists and user has permission to upload photos
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        members: {
          where: { userId: actualUserId }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is a member or creator of the event
    const isMember = event.members.length > 0 || event.creatorId === actualUserId;
    if (!isMember) {
      return NextResponse.json(
        { error: 'You must be a member of this event to upload photos' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const caption = formData.get('caption') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No photo file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate R2 key and upload
    const r2Key = generatePhotoKey(eventId, file.name);
    console.log('Attempting to upload photo:', {
      eventId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      r2Key
    });
    
    const uploadResult = await uploadToR2(file, r2Key, file.type);
    console.log('Upload result:', uploadResult);

    if (!uploadResult.success) {
      console.error('R2 upload failed:', uploadResult.error);
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload photo' },
        { status: 500 }
      );
    }

    // Save photo record to database
    const eventPhoto = await prisma.eventPhoto.create({
      data: {
        eventId,
        uploaderId: actualUserId,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: uploadResult.url!,
        r2Key: uploadResult.key!,
        caption: caption || null,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      photo: eventPhoto,
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const photos = await prisma.eventPhoto.findMany({
      where: { eventId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ photos });

  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
