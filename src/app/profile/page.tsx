"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSavedUserName, saveUserName } from "@/lib/user-utils"

export default function ProfilePage() {
  const router = useRouter()
  const [userPhone, setUserPhone] = useState("")
  const [userName, setUserName] = useState("Nutzer")
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      const savedName = getSavedUserName(phone)
      if (savedName && savedName !== phone) {
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

  const handleSaveName = async () => {
    if (tempName.trim()) {
      setSaving(true)
      try {
        setUserName(tempName.trim())
        await saveUserName(userPhone, tempName.trim())
      } catch (error) {
        console.error('Failed to save name:', error)
        // Could add error notification here
      } finally {
        setSaving(false)
      }
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
        <div className="max-w-2xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/events"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Events</span>
            </Link>
          </div>

          {/* Main Profile Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Header Section */}
            <div className="p-8 pb-6">
              <div className="flex items-center gap-6 mb-6">
                {/* Profile Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    My Profile
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your profile information
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information Section */}
            <div className="px-8 pb-8">
              <div className="space-y-6">
                {/* Phone Number (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {userPhone}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Phone number cannot be changed
                  </p>
                </div>

                {/* Username Edit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  {editingName ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter username"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveName}
                          disabled={saving}
                          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {saving ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                <path fill="currentColor" className="opacity-75" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <span className="text-gray-900 dark:text-white font-medium text-lg">
                        {userName}
                      </span>
                      <button
                        onClick={handleEditName}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Your profile is stored locally in your browser.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
