'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  date: string;
}

interface EventWithMembers extends Event {
  memberCount: number;
}

interface EventsListProps {
  events: Event[];
  loading?: boolean;
}

export function EventsList({ events, loading = false }: EventsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventsWithMembers, setEventsWithMembers] = useState<EventWithMembers[]>([]);
  
  // Load member counts for all events
  useEffect(() => {
    if (loading) return; // Don't load member counts if still loading events
    
    // Immediately show events with 0 member count
    if (events.length > 0 && eventsWithMembers.length === 0) {
      setEventsWithMembers(events.map(event => ({ ...event, memberCount: 0 })));
    }
    
    const loadMemberCounts = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const eventsWithMemberCounts = await Promise.all(
        events.map(async (event) => {
          try {
            const response = await fetch(`/api/events/${event.id}?token=${token}`);
            const data = await response.json();
            if (data.success && data.event.members) {
              return { ...event, memberCount: data.event.members.length };
            }
            return { ...event, memberCount: 0 };
          } catch {
            return { ...event, memberCount: 0 };
          }
        })
      );
      setEventsWithMembers(eventsWithMemberCounts);
    };

    if (events.length > 0) {
      loadMemberCounts();
    } else if (!loading) {
      // Clear events when not loading and no events
      setEventsWithMembers([]);
    }
  }, [events, loading, eventsWithMembers.length]);
  
  const filteredEvents = eventsWithMembers.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (event.location?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <input
          type="text"
          placeholder="Events durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-4 pr-4 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          disabled={loading}
        />
      </div>
      
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 sm:p-16 text-center mb-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin h-16 w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Loading events...</p>
            </div>
          </div>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group overflow-hidden active:scale-[0.98] sm:active:scale-100">
                
                {/* Compact Content Section */}
                <div className="p-3 sm:p-4 md:p-6">
                  
                  {/* Event Title and Action */}
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight flex-1 pr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.name}
                    </h2>
                    
                    {/* Compact tap indicator */}
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Info Row - Horizontal Layout */}
                  <div className="flex items-center space-x-4 mb-3">
                    {/* Date */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center">
                        <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        {new Date(event.date).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    
                    {/* Members */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-md flex items-center justify-center">
                        <svg className="w-3 h-3 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        {event.memberCount}
                      </span>
                    </div>

                    {/* Location - if exists */}
                    {event.location && (
                      <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          {event.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description - Compact */}
                  {event.description && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-1 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  
                  {/* Desktop-only footer with action button */}
                  <div className="hidden md:flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-3">
                    <span className="text-blue-500 dark:text-blue-400 font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
                      Details anzeigen
                    </span>
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 sm:p-16 text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Keine Events gefunden
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 max-w-md mx-auto text-base sm:text-lg leading-relaxed">
            Du hast noch keine Events erstellt oder bist keinem Event beigetreten.
          </p>
        </div>
      )}
    </div>
  );
}
