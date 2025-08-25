import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()
    if (!phone) {
      return NextResponse.json({ success: false, message: "Telefonnummer ist erforderlich" }, { status: 400 })
    }
    const normalizedPhone = phone.replace(/\D/g, "")
    const phoneRegex = /^\d{6,15}$/
    if (!phoneRegex.test(normalizedPhone)) {
      return NextResponse.json({ success: false, message: "Ungültiges Telefonnummernformat" }, { status: 400 })
    }
    let user = await prisma.user.findUnique({ where: { phone: normalizedPhone } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name: `Benutzer ${normalizedPhone.slice(-4)}`,
        }
      })
    }
    // Session-Token generieren (simple, unsicher für Demo-Zwecke)
    const token = Buffer.from(normalizedPhone).toString("base64")
    return NextResponse.json({ success: true, token, user }, { status: 200 })
  } catch (error) {
    console.error("Login-Fehler:", error)
    return NextResponse.json({ success: false, message: "Serverfehler" }, { status: 500 })
  }
}
