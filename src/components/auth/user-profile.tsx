"use client"

import { useSession } from "next-auth/react"
import Image from "next/image"

export default function UserProfile() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="animate-pulse flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="hidden sm:block w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <div className="relative">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            className="rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
      </div>
      <div className="hidden sm:flex flex-col min-w-0">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {session.user.name || 'User'}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {session.user.email}
        </span>
      </div>
    </div>
  )
}
