import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    console.log("🔑 Login API called")
    console.log("🌍 Environment:", process.env.NODE_ENV)
    console.log("🗄️ Database URL configured:", !!process.env.DATABASE_URL)
    
    const { phone } = await request.json()
    console.log("📞 Received phone:", phone)
    
    if (!phone) {
      console.log("❌ No phone provided")
      return NextResponse.json({ success: false, message: "Telefonnummer ist erforderlich" }, { status: 400 })
    }
    
    const normalizedPhone = phone.replace(/\D/g, "")
    console.log("📞 Normalized phone:", normalizedPhone)
    
    const phoneRegex = /^\d{6,15}$/
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
      console.log("👤 Creating new user")
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name: `Benutzer ${normalizedPhone.slice(-4)}`,
        }
      })
      console.log("✅ User created:", user.id)
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
      name: error instanceof Error ? error.name : 'Unknown error type'
    })
    
    // Return more detailed error information in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json({ 
      success: false, 
      message: "Serverfehler",
      ...(isDevelopment && { 
        debug: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        }
      })
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
