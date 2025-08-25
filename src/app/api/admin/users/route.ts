import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();
const ADMIN_PHONE = '015153352436';

// Phone number normalization function
const normalizePhoneNumber = (phone: string): string => {
  // Remove all spaces and non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('+4915')) {
    return '015' + cleaned.substring(5); // +4915153352436 -> 015153352436
  } else if (cleaned.startsWith('+491')) {
    return '01' + cleaned.substring(4); // +491234567890 -> 011234567890
  } else if (cleaned.startsWith('4915')) {
    return '015' + cleaned.substring(4); // 4915153352436 -> 015153352436
  } else if (cleaned.startsWith('491')) {
    return '01' + cleaned.substring(3); // 491234567890 -> 011234567890
  } else if (cleaned.startsWith('01')) {
    return cleaned; // 01234567890 -> 01234567890
  } else if (cleaned.match(/^\d{10,}$/)) {
    return '0' + cleaned; // 1234567890 -> 01234567890
  }
  
  return cleaned; // Return as-is if no pattern matches
};

export async function GET(request: NextRequest) {
  try {
    // Get the phone number from query params for verification
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('phone');

    // Verify admin access
    if (!userPhone || userPhone !== ADMIN_PHONE) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get all users with phone numbers and names
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        phoneVerified: true,
        createdEvents: {
          select: {
            id: true,
            name: true,
          }
        },
        eventMembers: {
          select: {
            event: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        _count: {
          select: {
            createdEvents: true,
            eventMembers: true,
            eventPhotos: true,
          }
        }
      },
      orderBy: [
        { phone: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform data for better frontend consumption
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Unbekannt',
      phone: user.phone || 'Keine Nummer',
      phoneVerified: user.phoneVerified,
      createdEventsCount: user._count.createdEvents,
      memberOfEventsCount: user._count.eventMembers,
      photosCount: user._count.eventPhotos,
      createdEvents: user.createdEvents,
      memberOfEvents: user.eventMembers.map(member => member.event)
    }));

    return NextResponse.json({ 
      users: transformedUsers,
      totalUsers: users.length,
      usersWithPhone: users.filter(u => u.phone).length,
      usersWithoutPhone: users.filter(u => !u.phone).length,
      verifiedUsers: users.filter(u => u.phoneVerified).length
    });

  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the phone number from query params for verification
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('phone');

    // Verify admin access
    if (!userPhone || userPhone !== ADMIN_PHONE) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Process all updates in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const updatePromises = updates.map(async (update: any) => {
        const { id, name, phone } = update;
        
        if (!id) {
          throw new Error('User ID is required');
        }

        // Validate required fields
        if (name !== undefined && (!name || !name.trim())) {
          throw new Error('Name ist erforderlich');
        }

        // Prepare update data
        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) {
          const normalizedPhone = normalizePhoneNumber(phone);
          if (!normalizedPhone.match(/^0\d{9,14}$/)) {
            throw new Error('Ungültiges Telefonnummernformat');
          }
          updateData.phone = normalizedPhone;
        }

        // Update user
        return await tx.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            name: true,
            phone: true,
            phoneVerified: true,
          }
        });
      });

      return await Promise.all(updatePromises);
    });

    return NextResponse.json({ 
      success: true, 
      updatedUsers: results,
      message: `${results.length} Benutzer erfolgreich aktualisiert`
    });

  } catch (error) {
    console.error('Error updating users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the phone number from query params for verification
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('phone');

    // Verify admin access
    if (!userPhone || userPhone !== ADMIN_PHONE) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefonnummer ist erforderlich' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const normalizedPhone = normalizePhoneNumber(phone);
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Benutzer mit dieser Telefonnummer existiert bereits' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: normalizedPhone,
        phoneVerified: null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        phoneVerified: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: newUser,
      message: 'Benutzer erfolgreich hinzugefügt'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the phone number from query params for verification
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('phone');
    const userIdToDelete = searchParams.get('id');

    // Verify admin access
    if (!userPhone || userPhone !== ADMIN_PHONE) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    if (!userIdToDelete) {
      return NextResponse.json(
        { error: 'User ID ist erforderlich' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
      include: {
        createdEvents: true,
        eventMembers: true,
        eventPhotos: true,
      }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Delete user (this will cascade delete related records due to schema constraints)
    await prisma.user.delete({
      where: { id: userIdToDelete }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Benutzer "${userToDelete.name || userToDelete.phone}" erfolgreich gelöscht`
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
