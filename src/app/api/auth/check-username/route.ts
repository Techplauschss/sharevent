import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { username } = await request.json()

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Benutzername ist erforderlich" }, { status: 400 })
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_]{3,}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        available: false, 
        error: "Benutzername muss mindestens 3 Zeichen lang sein und darf nur Kleinbuchstaben, Zahlen und Unterstriche enthalten" 
      }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    const available = !existingUser

    return NextResponse.json({ 
      available,
      message: available ? "Benutzername ist verfügbar" : "Benutzername ist bereits vergeben"
    })
    
  } catch (error) {
    console.error("Fehler beim Prüfen des Benutzernamens:", error)
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 })
  }
}
