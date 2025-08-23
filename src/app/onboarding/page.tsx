"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  // Debounced username check
  const checkUsername = async (value: string) => {
    if (value.length < 3) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value })
      })
      const result = await response.json()
      setIsAvailable(result.available)
    } catch (error) {
      console.error("Fehler beim Prüfen des Benutzernamens:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
    setUsername(value)
    
    // Debounce the username check
    setTimeout(() => checkUsername(value), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || username.length < 3) {
      setMessage("Benutzername muss mindestens 3 Zeichen lang sein")
      return
    }

    if (!isAvailable) {
      setMessage("Dieser Benutzername ist nicht verfügbar")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      })

      const result = await response.json()

      if (result.success) {
        // Update session
        await update()
        router.push("/events")
      } else {
        setMessage(result.message || "Fehler beim Speichern des Benutzernamens")
      }
    } catch (error) {
      setMessage("Fehler beim Speichern des Benutzernamens")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Willkommen bei ShareVent!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Wählen Sie einen einzigartigen Benutzernamen
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Benutzername
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10 ${
                    isAvailable === false ? 'border-red-300' : 
                    isAvailable === true ? 'border-green-300' : 'border-gray-300'
                  }`}
                  placeholder="meinbenutzername"
                  required
                  minLength={3}
                />
                
                {/* Status Icon */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isChecking && (
                    <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {!isChecking && isAvailable === true && (
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {!isChecking && isAvailable === false && (
                    <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              
              <p className="mt-1 text-xs text-gray-500">
                Nur Kleinbuchstaben, Zahlen und Unterstriche erlaubt. Mindestens 3 Zeichen.
              </p>
              
              {isAvailable === true && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ Benutzername ist verfügbar
                </p>
              )}
              {isAvailable === false && (
                <p className="mt-1 text-xs text-red-600">
                  ✗ Benutzername ist bereits vergeben
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !isAvailable || !username}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Speichere...
                </div>
              ) : (
                "Benutzername speichern"
              )}
            </button>
          </form>

          {message && (
            <div className="mt-4 p-3 rounded-md text-sm bg-red-50 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700">
              {message}
            </div>
          )}
        </div>

        {/* Info-Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            🎯 Ihr Benutzername
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Ihr Benutzername ist einzigartig und kann später nicht mehr geändert werden. 
            Wählen Sie einen Namen, den Sie gerne verwenden möchten.
          </p>
        </div>
      </div>
    </div>
  )
}
