'use client';

import { Event, User, EventMember } from '@/generated/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { QuickPhotoUpload } from './QuickPhotoUpload';
import { useState, useEffect } from 'react';
import { getProxiedImageUrl, isR2Url } from '@/lib/image-utils';

interface EventPhoto {
  id: string;
  url: string;
  filename: string;
  caption?: string;
}

interface EventWithRelations extends Event {
  creator: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  members: (EventMember & {
    user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  })[];
}

interface EventCardProps {
  event: EventWithRelations;
  currentUserId?: string;
  onPhotoUploaded?: () => void;
}

export function EventCard({ event, currentUserId, onPhotoUploaded }: EventCardProps) {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Fetch photos for this event
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`/api/events/${event.id}/photos`);
        if (response.ok) {
          const data = await response.json();
          console.log('EventCard photos data for', event.name, ':', data);
          setPhotos(data.photos || []);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, [event.id]);

  // Refetch photos when a new photo is uploaded
  useEffect(() => {
    if (onPhotoUploaded) {
      const fetchPhotos = async () => {
        try {
          const response = await fetch(`/api/events/${event.id}/photos`);
          if (response.ok) {
            const data = await response.json();
            setPhotos(data.photos || []);
          }
        } catch (error) {
          console.error('Error fetching photos:', error);
        }
      };
      
      fetchPhotos();
    }
  }, [onPhotoUploaded, event.id]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCreator = currentUserId === event.creatorId;
  const isMember = event.members.some(member => member.userId === currentUserId);
  const memberCount = event.members.length;
  const displayMembers = event.members.slice(0, 3);

  // Determine if event is happening soon, today, or past
  const now = new Date();
  const eventDate = new Date(event.date);
  const isToday = eventDate.toDateString() === now.toDateString();
  const isPast = eventDate < now;
  const isUpcoming = eventDate > now;
  const timeDiff = eventDate.getTime() - now.getTime();
  const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Get the first photo as hero image
  const heroPhoto = photos.length > 0 ? photos[0] : null;
  
  // Debug logging
  useEffect(() => {
    console.log('EventCard debug for', event.name, ':', {
      photosLength: photos.length,
      heroPhoto: heroPhoto ? { url: heroPhoto.url, filename: heroPhoto.filename } : null,
      loadingPhotos
    });
  }, [photos, heroPhoto, loadingPhotos, event.name]);

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600">
      {/* Header without hero image */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
            isCreator 
              ? 'bg-white/90 text-blue-600' 
              : isMember 
                ? 'bg-white/90 text-blue-600'
                : 'bg-white/70 text-gray-700'
          }`}>
            {isCreator ? '👑 Your Event' : isMember ? '✓ Member' : 'Public Event'}
          </span>
        </div>

        {/* Time Badge */}
        <div className="absolute top-4 right-4 z-10">
          {isToday ? (
            <span className="px-3 py-1 bg-red-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm animate-pulse">
              🔴 Today
            </span>
          ) : isPast ? (
            <span className="px-3 py-1 bg-gray-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm">
              📅 Past
            </span>
          ) : daysUntil <= 7 ? (
            <span className="px-3 py-1 bg-orange-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm">
              ⏰ {daysUntil} days
            </span>
          ) : null}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Event Title */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {event.name}
          </h3>
          
          {event.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Event Meta Information */}
        <div className="space-y-3">
          {/* Date & Time */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">{formatDate(event.date)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(event.date)}</div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="truncate">{event.location}</div>
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              {displayMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gradient-to-r from-blue-400 to-purple-600"
                  style={{ zIndex: displayMembers.length - index }}
                  title={member.user.name || member.user.email || 'Member'}
                >
                  {member.user.image ? (
                    <img 
                      src={member.user.image} 
                      alt={member.user.name || 'Member'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {(member.user.name || member.user.email || 'M')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {memberCount > 3 && (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                    +{memberCount - 3}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">{memberCount}</span>
              {memberCount === 1 ? ' member' : ' members'}
            </div>
          </div>
          
          <Link href={`/events/${event.id}`}>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
              {isMember ? 'Open Event' : 'View Details'}
              <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
      </div>

      {/* Photo Gallery Preview */}
      {!loadingPhotos && photos.length > 0 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent Photos ({photos.length})
            </h4>
            <Link href={`/events/${event.id}`} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
              View all →
            </Link>
          </div>
          
          {/* Photo Grid - Show up to 4 photos */}
          <div className="grid grid-cols-4 gap-2">
            {photos.slice(0, 4).map((photo, index) => (
              <div 
                key={photo.id}
                className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 group cursor-pointer hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    // Show fallback with photo icon
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                          </svg>
                        </div>
                      `;
                    }
                  }}
                />
                
                {/* Overlay with photo info */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show "more photos" indicator if there are more than 4 */}
            {photos.length > 4 && (
              <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-500 dark:text-gray-400">
                    +{photos.length - 3}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    more
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
