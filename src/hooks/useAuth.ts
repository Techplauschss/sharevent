"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useRequireAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/api/auth/signin")
    }
  }, [session, status, router])

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  }
}

export function useOptionalAuth() {
  const { data: session, status } = useSession()

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  }
}
