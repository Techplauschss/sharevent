import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log("🏥 Health check called")
    console.log("🌍 Environment:", process.env.NODE_ENV)
    console.log("🗄️ Database URL configured:", !!process.env.DATABASE_URL)
    console.log("🗄️ Database URL preview:", process.env.DATABASE_URL?.substring(0, 20) + "...")
    
    // Test database connection
    console.log("🔍 Testing database connection...")
    await prisma.$connect()
    console.log("✅ Database connection successful")
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log("📊 Total users in database:", userCount)
    
    return NextResponse.json({ 
      success: true, 
      message: "API and database are healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount: userCount
      },
      environment: process.env.NODE_ENV
    }, { status: 200 })

  } catch (error) {
    console.error("❌ Health check failed:", error)
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    })
    
    return NextResponse.json({ 
      success: false, 
      message: "Health check failed",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      database: {
        connected: false
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
