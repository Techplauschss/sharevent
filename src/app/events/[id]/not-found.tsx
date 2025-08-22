import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center">
      <div className="glass-effect rounded-2xl p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Event Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sorry, the event you're looking for doesn't exist or may have been removed.
        </p>
        <div className="space-y-3">
          <Link href="/events">
            <button className="w-full btn-gradient text-white px-6 py-3 rounded-xl">
              Browse Events
            </button>
          </Link>
          <Link href="/events/create">
            <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Create New Event
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
