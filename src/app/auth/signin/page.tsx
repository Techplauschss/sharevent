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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 md:space-y-10 relative z-10">
        <div>
          <h2 className="mt-4 md:mt-6 text-center text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white drop-shadow-2xl" style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.15)' }}>
            Bei <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-black tracking-wide drop-shadow-2xl">ShareVent</span> anmelden
          </h2>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 md:p-6 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50">
          <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                Telefonnummer
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                minLength={10}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
              className="w-full flex justify-center py-2 md:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <div className="mt-3 md:mt-4 p-3 rounded-md text-xs md:text-sm bg-red-50 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700">
              {message}
            </div>
          )}
        </div>

        {/* Info-Box */}
        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50/80 dark:bg-blue-900/50 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-xl shadow-lg">
          <h4 className="text-xs md:text-sm font-medium text-blue-800 dark:text-blue-200 mb-1 md:mb-2">
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
