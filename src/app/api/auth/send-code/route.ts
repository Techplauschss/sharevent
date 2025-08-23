import { NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()
    
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Telefonnummer ist erforderlich" },
        { status: 400 }
      )
    }

  // sendVerificationCode existiert nicht, daher Fehlerantwort
  return NextResponse.json({ success: false, message: "Verifizierungscode-Funktion nicht implementiert." }, { status: 501 })
  } catch (error) {
    console.error("API Fehler:", error)
    return NextResponse.json(
      { success: false, message: "Serverfehler" },
      { status: 500 }
    )
  }
}
