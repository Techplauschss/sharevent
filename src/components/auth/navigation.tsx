"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getSavedUserName, USER_NAME_UPDATED_EVENT } from "@/lib/user-utils"

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userPhone, setUserPhone] = useState("")
  const [userName, setUserName] = useState("User")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    setIsLoggedIn(!!token)
    
    if (token) {
      // Decode phone number from token
      try {
        const phone = atob(token)
        setUserPhone(phone)
        
        // Load saved username using utility function
        const savedName = getSavedUserName(phone)
        if (savedName && savedName !== phone) {
          setUserName(savedName)
        }
      } catch (error) {
        console.error("Failed to decode token:", error)
      }
    }
  }, [])

  // Separate useEffect for listening to updates, depends on userPhone
  useEffect(() => {
    if (!userPhone) return

    // Listen for username updates
    const handleUserNameUpdate = (event: CustomEvent) => {
      const { phone, name } = event.detail
      if (phone === userPhone) {
        setUserName(name)
      }
    }

    window.addEventListener(USER_NAME_UPDATED_EVENT, handleUserNameUpdate as EventListener)

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener(USER_NAME_UPDATED_EVENT, handleUserNameUpdate as EventListener)
    }
  }, [userPhone])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setIsLoggedIn(false)
    setUserPhone("")
    setUserName("User")
    window.location.href = "/auth/signin"
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/events" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ShareVent
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/events"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Events
            </Link>
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Mini Profile - Clickable Link to Profile Page */}
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Avatar Placeholder */}
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {userName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {userPhone}
                    </span>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile User Section - Only Profile Avatar */}
          <div className="md:hidden flex items-center">
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="px-3 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
