"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"

// Phone number normalization function
const normalizePhoneNumber = (phone: string): string => {
  // Remove all spaces and non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('+4915')) {
    return '015' + cleaned.substring(5); // +4915153352436 -> 015153352436
  } else if (cleaned.startsWith('+491')) {
    return '01' + cleaned.substring(4); // +491234567890 -> 011234567890
  } else if (cleaned.startsWith('4915')) {
    return '015' + cleaned.substring(4); // 4915153352436 -> 015153352436
  } else if (cleaned.startsWith('491')) {
    return '01' + cleaned.substring(3); // 491234567890 -> 011234567890
  } else if (cleaned.startsWith('01')) {
    return cleaned; // 01234567890 -> 01234567890
  } else if (cleaned.match(/^\d{10,}$/)) {
    return '0' + cleaned; // 1234567890 -> 01234567890
  }
  
  return cleaned; // Return as-is if no pattern matches
};

export default function SignInPage() {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [existingUser, setExistingUser] = useState<{ name: string } | null>(null)
  const [checkingUser, setCheckingUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Prüfung ob Benutzer bereits existiert
  const checkExistingUser = async (phoneNumber: string) => {
    // Normalize phone number before checking
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    if (normalizedPhone.length < 10) {
      setExistingUser(null)
      setName("")
      return
    }

    setCheckingUser(true)
    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone })
      })
      const result = await response.json()
      
      if (result.exists && result.user) {
        setExistingUser(result.user)
        setName(result.user.name || "")
      } else {
        setExistingUser(null)
        setName("")
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setExistingUser(null)
      setName("")
    } finally {
      setCheckingUser(false)
    }
  }

  // Debounced effect für Benutzerprüfung
  useEffect(() => {
    const normalizedPhone = normalizePhoneNumber(phone);
    if (normalizedPhone.length >= 10) {
      const timeoutId = setTimeout(() => {
        checkExistingUser(phone)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } else {
      setExistingUser(null)
      setName("")
    }
  }, [phone])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Normalize phone number before validation
    const normalizedPhone = normalizePhoneNumber(phone);

    // Validierung: Mindestens 10 Zeichen für normalisierte Telefonnummer
    if (normalizedPhone.length < 10) {
      setMessage("Telefonnummer muss mindestens 10 Zeichen lang sein")
      setLoading(false)
      return
    }

    // Validierung: Name muss mindestens 3 Zeichen haben
    if (name.length < 3) {
      setMessage("Name muss mindestens 3 Zeichen lang sein")
      setLoading(false)
      return
    }

    console.log('🔑 Starting login process with phone:', phone, 'normalized:', normalizedPhone, 'and name:', name)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name })
      })
      const result = await response.json()
      console.log('🔑 Login result:', result)
      if (result.success && result.token) {
        // Token speichern (z.B. im LocalStorage)
        localStorage.setItem("authToken", result.token)
        // Erfolgreiche Anmeldung - zur Events-Seite weiterleiten
        window.location.href = "/events"
      } else {
        setMessage(result.message || "Fehler bei der Anmeldung.")
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setMessage("Fehler bei der Anmeldung")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Bei ShareVent anmelden
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Geben Sie Ihre Telefonnummer ein, um sich anzumelden oder zu registrieren
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Telefonnummer
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                minLength={10}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="+49 123 456 7890"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: +49 123 456 7890 oder 0123 456 7890 (mindestens 10 Zeichen)
              </p>
            </div>

            {/* Namensfeld - erscheint nach Telefonnummer-Eingabe */}
            {phone.length >= 10 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                  {existingUser && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                      (Bestehender Benutzer gefunden)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ihr vollständiger Name"
                    required
                  />
                  {checkingUser && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Mindestens 3 Zeichen. {existingUser ? 'Aktualisiert Ihren bestehenden Namen.' : 'Wird für Ihr neues Konto verwendet.'}
                </p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || phone.length < 10 || name.length < 3}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Anmelden...
                </div>
              ) : (
                "Anmelden"
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
            📱 Einfache Anmeldung
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Geben Sie einfach Ihre Telefonnummer ein und Sie werden automatisch angemeldet. 
            Falls Sie neu sind, wird automatisch ein Konto für Sie erstellt.
          </p>
        </div>
      </div>
    </div>
  )
}
