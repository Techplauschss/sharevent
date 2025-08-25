import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()
    
    if (!phone) {
      return NextResponse.json({ exists: false }, { status: 200 })
    }
    
    // Normalisiere die Telefonnummer
    const normalizedPhone = normalizePhoneNumber(phone)
    
    if (normalizedPhone.length < 10) {
      return NextResponse.json({ exists: false }, { status: 200 })
    }
    
    // Prüfe ob Benutzer existiert
    const user = await prisma.user.findUnique({ 
      where: { phone: normalizedPhone },
      select: {
        id: true,
        name: true,
        phone: true
      }
    })
    
    if (user) {
      return NextResponse.json({ 
        exists: true, 
        user: {
          name: user.name || "",
          phone: user.phone
        }
      })
    } else {
      return NextResponse.json({ exists: false })
    }
    
  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json({ exists: false }, { status: 200 })
  }
}
