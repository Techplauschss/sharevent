import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  if (!token) {
    return NextResponse.json({ success: false, message: "Token fehlt" }, { status: 401 })
  }
  const phone = Buffer.from(token, "base64").toString()
  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    return NextResponse.json({ success: false, message: "Kein Nutzer gefunden" }, { status: 404 })
  }
  // Events des Nutzers abrufen (über EventMember)
  const eventMembers = await prisma.eventMember.findMany({ where: { userId: user.id }, include: { event: true } })
  const events = eventMembers.map(em => em.event)
  return NextResponse.json({ success: true, events }, { status: 200 })
}
