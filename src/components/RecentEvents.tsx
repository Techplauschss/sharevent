'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EventPhoto {
  id: string;
  url: string;
  filename: string;
}

interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  createdAt: string;
  creator: {
    name: string | null;
    image: string | null;
  };
}

export function RecentEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Record<string, EventPhoto[]>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const eventsPerPage = 3;
  const totalPages = Math.ceil(events.length / eventsPerPage);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          const sortedEvents = data.events.sort((a: Event, b: Event) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setEvents(sortedEvents);

          // Fetch photos for each event
          const photoPromises = sortedEvents.map(async (event: Event) => {
            try {
              const photoResponse = await fetch(`/api/events/${event.id}/photos`);
              if (photoResponse.ok) {
                const photoData = await photoResponse.json();
                return { eventId: event.id, photos: photoData.photos || [] };
              }
            } catch (error) {
              console.error(`Error fetching photos for event ${event.id}:`, error);
            }
            return { eventId: event.id, photos: [] };
          });

          const photoResults = await Promise.all(photoPromises);
          const photoMap: Record<string, EventPhoto[]> = {};
          photoResults.forEach(result => {
            photoMap[result.eventId] = result.photos;
          });
          setPhotos(photoMap);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const getCurrentEvents = () => {
    const startIndex = currentPage * eventsPerPage;
    return events.slice(startIndex, startIndex + eventsPerPage);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Letzte Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-effect rounded-2xl p-6 h-64 bg-gray-200 dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Noch keine Events
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Erstelle dein erstes Event und teile es mit Freunden!
        </p>
        <Link
          href="/events/create"
          className="btn-gradient px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          Erstes Event erstellen
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Letzte Events
        </h2>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              className="p-2 rounded-full glass-effect hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={events.length <= eventsPerPage}
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-sm text-gray-500 dark:text-gray-400 px-3">
              {currentPage + 1} / {totalPages}
            </span>
            
            <button
              onClick={nextPage}
              className="p-2 rounded-full glass-effect hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={events.length <= eventsPerPage}
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getCurrentEvents().map((event) => {
          const eventPhotos = photos[event.id] || [];
          const coverPhoto = eventPhotos.length > 0 ? eventPhotos[0] : null;

          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="card-hover glass-effect rounded-2xl overflow-hidden group"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                {coverPhoto ? (
                  <img
                    src={coverPhoto.url}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Photo Count Badge */}
                {eventPhotos.length > 0 && (
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    📸 {eventPhotos.length}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {event.name}
                </h3>
                
                {event.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500 dark:text-gray-400">
                    📅 {formatDate(event.date)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {event.creator.image && (
                      <img
                        src={event.creator.image}
                        alt={event.creator.name || 'Creator'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {event.creator.name}
                    </span>
                  </div>
                </div>

                {event.location && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    📍 {event.location}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Navigation Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentPage 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
