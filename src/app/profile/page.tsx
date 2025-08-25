"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const [userPhone, setUserPhone] = useState("")
  const [userName, setUserName] = useState("Nutzer")
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    
    if (!token) {
      router.push("/auth/signin")
      return
    }

    try {
      const phone = atob(token)
      setUserPhone(phone)
      
      // Load saved username from localStorage
      const savedName = localStorage.getItem(`userName_${phone}`)
      if (savedName) {
        setUserName(savedName)
      }
    } catch (error) {
      console.error("Failed to decode token:", error)
      router.push("/auth/signin")
      return
    }

    setLoading(false)
  }, [router])

  const handleEditName = () => {
    setTempName(userName)
    setEditingName(true)
  }

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim())
      localStorage.setItem(`userName_${userPhone}`, tempName.trim())
    }
    setEditingName(false)
    setTempName("")
  }

  const handleCancelEdit = () => {
    setEditingName(false)
    setTempName("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Profil wird geladen...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mein Profil
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Verwalte deine Profil-Informationen
            </p>
          </div>
          
          <Link
            href="/events"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Zurück zu Events</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-effect rounded-2xl p-8 border border-white/20 dark:border-gray-700/50">
            {/* Profile Avatar */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              {/* Phone Number (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Telefonnummer
                </label>
                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                  {userPhone}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Die Telefonnummer kann nicht geändert werden
                </p>
              </div>

              {/* Username Edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Benutzername
                </label>
                {editingName ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Benutzername eingeben"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveName}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Speichern</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Abbrechen</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <span className="text-gray-900 dark:text-white font-medium text-lg">
                      {userName}
                    </span>
                    <button
                      onClick={handleEditName}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Bearbeiten</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Dein Profil wird lokal in deinem Browser gespeichert.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
