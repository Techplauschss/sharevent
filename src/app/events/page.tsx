import { auth } from "@/auth";
import Link from "next/link";
import { EventsList } from "@/components/EventsList";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export default async function Events() {
  const session = await auth();

  // Get the actual user ID from database
  let actualUserId = session?.user?.id;
  
  if (session?.user?.id) {
    // Find user by session ID (should exist since we use phone authentication)
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user) {
      actualUserId = user.id;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Events
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Discover amazing events and connect with people who share your interests
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/events/create">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3">
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Event</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Events List Component */}
          <EventsList currentUserId={actualUserId} />
        </div>
      </div>
    </div>
  );
}
