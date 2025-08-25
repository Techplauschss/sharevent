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
    console.log("🔑 Login API called")
    console.log("🌍 Environment:", process.env.NODE_ENV)
    console.log("🗄️ Database URL configured:", !!process.env.DATABASE_URL)
    
    const { phone, name } = await request.json()
    console.log("📞 Received phone:", phone)
    console.log("👤 Received name:", name)
    
    if (!phone) {
      console.log("❌ No phone provided")
      return NextResponse.json({ success: false, message: "Telefonnummer ist erforderlich" }, { status: 400 })
    }

    if (!name || name.length < 3) {
      console.log("❌ No valid name provided")
      return NextResponse.json({ success: false, message: "Name muss mindestens 3 Zeichen lang sein" }, { status: 400 })
    }
    
    const normalizedPhone = normalizePhoneNumber(phone)
    console.log("📞 Normalized phone from", phone, "to:", normalizedPhone)
    
    if (normalizedPhone.length < 10) {
      console.log("❌ Phone too short:", normalizedPhone)
      return NextResponse.json({ success: false, message: "Telefonnummer muss mindestens 10 Zeichen lang sein" }, { status: 400 })
    }
    
    const phoneRegex = /^0\d{9,14}$/
    if (!phoneRegex.test(normalizedPhone)) {
      console.log("❌ Invalid phone format:", normalizedPhone)
      return NextResponse.json({ success: false, message: "Ungültiges Telefonnummernformat" }, { status: 400 })
    }
    
    // Test database connection
    console.log("🔍 Testing database connection...")
    await prisma.$connect()
    console.log("✅ Database connection successful")
    
    console.log("🔍 Looking for user with phone:", normalizedPhone)
    let user = await prisma.user.findUnique({ where: { phone: normalizedPhone } })
    console.log("👤 Found user:", user ? "Yes" : "No")
    
    if (!user) {
      console.log("👤 Creating new user with name:", name)
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name: name.trim(),
        }
      })
      console.log("✅ User created:", user.id)
    } else {
      // Benutzer existiert bereits - aktualisiere den Namen
      console.log("👤 Updating existing user name from:", user.name, "to:", name)
      user = await prisma.user.update({
        where: { phone: normalizedPhone },
        data: {
          name: name.trim()
        }
      })
      console.log("✅ User name updated")
    }
    
    // Session-Token generieren (simple, unsicher für Demo-Zwecke)
    const token = Buffer.from(normalizedPhone).toString("base64")
    console.log("🔑 Generated token for phone:", normalizedPhone)
    
    return NextResponse.json({ success: true, token, user }, { status: 200 })
  } catch (error) {
    console.error("❌ Login-Fehler:", error)
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type',
      code: (error as any)?.code,
      errno: (error as any)?.errno,
      syscall: (error as any)?.syscall
    })
    
    // Log environment info for debugging
    console.error("🌍 Environment debug info:", {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlStart: process.env.DATABASE_URL?.substring(0, 20),
      platform: process.platform
    })
    
    // Return more detailed error information in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json({ 
      success: false, 
      message: "Serverfehler",
      ...(isDevelopment && { 
        debug: {
          error: error instanceof Error ? error.message : 'Unknown error',
          code: (error as any)?.code,
          type: error instanceof Error ? error.name : 'Unknown error type'
        }
      })
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
