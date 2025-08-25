'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
}

interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (event.location?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-4 pr-4 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
      
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                <h2 className="text-xl font-bold mb-2">{event.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{event.description}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{event.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-500 font-medium text-sm">View Details</span>
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-16 text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            No Events Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-md mx-auto text-lg leading-relaxed">
            You haven't created or joined any events yet.
          </p>
        </div>
      )}
    </div>
  );
}
