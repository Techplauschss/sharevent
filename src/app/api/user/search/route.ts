import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Suche nach Benutzern mit ähnlichen Telefonnummern
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            phone: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        phone: true,
        name: true,
      },
      take: 10, // Limitiere auf 10 Ergebnisse
    });

    // Filtere nur Benutzer mit Telefonnummer
    const usersWithPhone = users.filter(user => user.phone);

    return NextResponse.json({ users: usersWithPhone });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
