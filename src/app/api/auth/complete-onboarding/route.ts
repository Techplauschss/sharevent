import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { username } = await request.json()

    if (!username || typeof username !== "string") {
      return NextResponse.json({ 
        success: false, 
        message: "Benutzername ist erforderlich" 
      }, { status: 400 })
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_]{3,}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        success: false,
        message: "Benutzername muss mindestens 3 Zeichen lang sein und darf nur Kleinbuchstaben, Zahlen und Unterstriche enthalten" 
      }, { status: 400 })
    }

    // Check if name already exists
    const existingUser = await prisma.user.findFirst({
      where: { name: username }
    })

    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        message: "Benutzername ist bereits vergeben"
      }, { status: 400 })
    }

    // Update user with name
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: username
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "Benutzername erfolgreich gespeichert",
      user: {
        id: updatedUser.id,
        name: updatedUser.name
      }
    })
    
  } catch (error) {
    console.error("Fehler beim Speichern des Benutzernamens:", error)
    return NextResponse.json({ 
      success: false,
      message: "Serverfehler beim Speichern des Benutzernamens" 
    }, { status: 500 })
  }
}
