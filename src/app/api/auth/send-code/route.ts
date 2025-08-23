import { NextRequest, NextResponse } from "next/server"
import { sendVerificationCode } from "@/auth"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()
    
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Telefonnummer ist erforderlich" },
        { status: 400 }
      )
    }

    const result = await sendVerificationCode(phone)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Fehler:", error)
    return NextResponse.json(
      { success: false, message: "Serverfehler" },
      { status: 500 }
    )
  }
}
