import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

interface ProtectedPageProps {
  children: ReactNode
  fallback?: ReactNode
}

export default async function ProtectedPage({ 
  children, 
  fallback 
}: ProtectedPageProps) {
  const session = await auth()

  if (!session) {
    if (fallback) {
      return <>{fallback}</>
    }
    redirect("/api/auth/signin")
  }

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
