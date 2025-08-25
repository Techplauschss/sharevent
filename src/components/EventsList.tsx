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
}

export function EventsList({ events }: EventsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventsWithMembers, setEventsWithMembers] = useState<EventWithMembers[]>([]);
  
  // Load member counts for all events
  useEffect(() => {
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
    }
  }, [events]);
  
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
        />
      </div>
      
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group">
                {/* Event Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {event.name}
                  </h2>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Date Badge */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.date).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                      })}
                    </span>
                    
                    {/* Members Badge */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {event.memberCount} {event.memberCount === 1 ? 'Member' : 'Members'}
                    </span>
                    
                    {/* Location Badge (only if location exists) */}
                    {event.location && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                        </svg>
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                {event.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
                    {event.description}
                  </p>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-blue-500 dark:text-blue-400 font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
                    Details anzeigen
                  </span>
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            Keine Events gefunden
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-md mx-auto text-lg leading-relaxed">
            Du hast noch keine Events erstellt oder bist keinem Event beigetreten.
          </p>
        </div>
      )}
    </div>
  );
}
