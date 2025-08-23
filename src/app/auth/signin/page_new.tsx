"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignInPage() {
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"phone" | "verify">("phone")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      })

      const result = await response.json()
      
      if (result.success) {
        setStep("verify")
        setMessage("Verifizierungscode wurde an Ihre Telefonnummer gesendet")
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage("Fehler beim Senden des Codes")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const result = await signIn("phone-verify", {
        phone,
        code: verificationCode,
        callbackUrl: "/dashboard",
        redirect: false
      })

      if (result?.error) {
        setMessage("Ungültiger Verifizierungscode")
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      setMessage("Fehler bei der Verifizierung")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep("phone")
    setPhone("")
    setVerificationCode("")
    setMessage("")
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
          {step === "phone" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefonnummer
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="+49 123 456 7890"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: +49 123 456 7890 oder 0123 456 7890
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sende Code...
                  </div>
                ) : (
                  "Anmelden"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verifizierungscode
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-2xl tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Code an {phone} gesendet
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    "Verifizieren"
                  )}
                </button>
              </div>
            </form>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes("gesendet") 
                ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700" 
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Hinweise zur Demo */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            📱 Demo-Modus
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            In der Demo wird der Verifizierungscode in der Konsole ausgegeben. 
            In der Produktion würde eine echte SMS gesendet werden.
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Schauen Sie in die Browser-Konsole (F12) für den Code.
          </p>
        </div>
      </div>
    </div>
  )
}
