"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"

interface ProtectedPageProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function ProtectedPage({ 
  children, 
  fallback 
}: ProtectedPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Prüfe auf Auth-Token
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      setIsAuthenticated(false)
      if (!fallback) {
        router.push("/auth/signin")
      }
    } else {
      setIsAuthenticated(true)
    }
  }, [router, fallback])

  // Loading state
  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }
    return null // Router.push already called
  }

  // Authenticated
  return <>{children}</>
}

// Wrapper für geschützte Client-Komponenten
export function withAuth<T extends object>(
  Component: React.ComponentType<T>
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedPage>
        <Component {...props} />
      </ProtectedPage>
    )
  }
}
