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
