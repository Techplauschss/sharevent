"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { EventDetails } from "@/components/EventDetails"

interface Event {
  id: string
  name: string
  description?: string
  date: string
  location?: string
  createdAt: string
  updatedAt: string
  creatorId: string
  creator: {
    id: string
    name?: string
    phone: string
    image?: string
  }
  members: Array<{
    user: {
      id: string
      name?: string
      phone: string
      image?: string
    }
  }>
  photos: Array<{
    id: string
    url: string
    createdAt: string
    filename: string
  }>
}

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreator, setIsCreator] = useState(false)
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    const checkAuthAndLoadEvent = async () => {
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        router.push("/auth/signin")
        return
      }

      try {
        const response = await fetch(`/api/events/${params.id}?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setEvent(data.event)
          setIsCreator(data.isCreator)
          setIsMember(data.isMember)
        } else {
          setError(data.message || "Fehler beim Laden des Events")
        }
      } catch (error) {
        console.error("Fehler beim Laden des Events:", error)
        setError("Netzwerkfehler")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      checkAuthAndLoadEvent()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Loading Spinner */}
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Event wird geladen...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Fehler beim Laden
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <Link href="/events">
            <button className="btn-gradient text-white px-6 py-3 rounded-xl">
              Zurück zu Events
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Event nicht gefunden
          </h1>
          <Link href="/events">
            <button className="btn-gradient text-white px-6 py-3 rounded-xl">
              Zurück zu Events
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/events">
              <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Zurück zu Events</span>
              </button>
            </Link>
          </div>

          {/* Event Details Component */}
          <EventDetails 
            event={event}
            isCreator={isCreator}
            isMember={isMember}
          />
        </div>
      </div>
    </div>
  )
}
