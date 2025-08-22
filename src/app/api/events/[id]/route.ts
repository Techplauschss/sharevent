import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const isCreator = event.creatorId === session.user.id;
    const isMember = event.members.some(member => member.userId === session.user.id);
    
    // Also check if user exists by email (fallback for ID mismatches)
    const isMemberByEmail = session.user.email ? 
      event.members.some(member => member.user.email === session.user.email) : false;
    const isCreatorByEmail = session.user.email ? 
      event.creator.email === session.user.email : false;
    
    console.log('Delete permission check:', {
      sessionUserId: session.user.id,
      sessionUserEmail: session.user.email,
      eventCreatorId: event.creatorId,
      eventCreatorEmail: event.creator.email,
      isCreator,
      isMember,
      isCreatorByEmail,
      isMemberByEmail,
      memberIds: event.members.map(m => ({ id: m.userId, email: m.user.email }))
    });
    
    // Allow deletion if user is creator OR member (by ID or email)
    if (!isCreator && !isMember && !isCreatorByEmail && !isMemberByEmail) {
      return NextResponse.json({ 
        error: 'Only event members can delete this event',
        debug: {
          isCreator,
          isMember,
          isCreatorByEmail,
          isMemberByEmail,
          sessionUserId: session.user.id,
          sessionUserEmail: session.user.email,
          eventCreatorId: event.creatorId,
          eventCreatorEmail: event.creator.email
        }
      }, { status: 403 });
    }

    // Delete all photos from R2 storage
    if (event.photos.length > 0) {
      console.log(`Deleting ${event.photos.length} photos from R2...`);
      
      for (const photo of event.photos) {
        try {
          // Extract the key from the photo URL
          // URL format: https://bucket.accountid.r2.cloudflarestorage.com/events/eventId/filename
          const urlParts = photo.url.split('/');
          const key = urlParts.slice(-3).join('/'); // events/eventId/filename
          
          const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          });

          await s3Client.send(deleteCommand);
          console.log(`Deleted photo from R2: ${key}`);
        } catch (error) {
          console.error(`Failed to delete photo from R2: ${photo.url}`, error);
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
