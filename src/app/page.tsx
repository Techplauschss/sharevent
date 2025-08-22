import { auth } from "@/auth";
import Link from "next/link";
import { RecentEvents } from "@/components/RecentEvents";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <div className="animate-float">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Welcome to ShareVent
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create, share, and discover amazing events with friends and family. 
            The modern way to bring people together.
          </p>
          
          {session ? (
            <div className="glass-effect rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-16 h-16 rounded-full ring-4 ring-white dark:ring-gray-700 shadow-lg"
                  />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎉 Welcome back, {session.user?.name}!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You're all set to start creating and managing your events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/events"
                  className="btn-gradient px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Event-Übersicht
                </Link>
                <Link
                  href="/events/create"
                  className="px-8 py-3 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 hover:shadow-lg"
                >
                  Create Event
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-effect rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🚀 Get Started Today
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sign in to unlock the full potential of event management and sharing.
              </p>
            </div>
          )}

          {/* Recent Events Section */}
          {session ? (
            <RecentEvents />
          ) : (
            /* Features Grid für nicht angemeldete Benutzer */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="card-hover glass-effect rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📅 Create Events
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Easily create and customize events with all the details your guests need to know.
                </p>
              </div>
              
              <div className="card-hover glass-effect rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  👥 Share & Invite
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Share your events with friends and track RSVPs in real-time with smart notifications.
                </p>
              </div>
              
              <div className="card-hover glass-effect rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🎯 Manage Everything
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Keep track of all your events from a beautiful, centralized dashboard with analytics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
