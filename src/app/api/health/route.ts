import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🏥 Health check called - simple version")
    
    return NextResponse.json({ 
      success: true, 
      message: "API is healthy",
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (error) {
    console.error("❌ Health check failed:", error)
    
    return NextResponse.json({ 
      success: false, 
      message: "Health check failed",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
