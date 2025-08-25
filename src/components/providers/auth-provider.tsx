"use client"

import { ReactNode } from "react"

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Unser benutzerdefiniertes Auth-System benötigt keinen Provider
  // Die Authentifizierung wird über localStorage und Cookies verwaltet
  return <>{children}</>
}
