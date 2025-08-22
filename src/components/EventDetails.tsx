'use client';

import { useState } from 'react';
import { Event, User, EventMember } from '@/generated/prisma';
import { PhotoGallery } from './PhotoGallery';
import { PhotoUpload } from './PhotoUpload';

interface EventWithRelations extends Event {
  creator: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  members: (EventMember & {
    user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  })[];
}

interface EventDetailsProps {
  event: EventWithRelations;
  currentUserId: string;
  isCreator: boolean;
  isMember: boolean;
}

export function EventDetails({ event, currentUserId, isCreator, isMember }: EventDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(true);
  const [photoCount, setPhotoCount] = useState(0);
  const [photoRefreshTrigger, setPhotoRefreshTrigger] = useState(0);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJoinEvent = async () => {
    if (isMember) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.reload(); // Refresh to show updated membership
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Failed to join event');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!isMember || isCreator) return;
    
    if (!confirm('Are you sure you want to leave this event?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.href = '/events'; // Redirect back to events list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to leave event');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      alert('Failed to leave event');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploaded = () => {
    // Trigger photo gallery refresh by incrementing a counter
    setPhotoRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteEvent = async () => {
    if (!isMember && !isCreator) return;
    
    const confirmMessage = `Are you sure you want to delete "${event.name}"?\n\nThis will permanently delete:\n- The event\n- All event photos\n- All member associations\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to events list after successful deletion
        window.location.href = '/events';
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        // Show more detailed error information
        if (error.debug) {
          console.log('Debug info:', error.debug);
        }
        alert(error.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Main Event Card - Sleek Design */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {event.name}
              </h1>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <span className="text-sm">
                  Created by {isCreator ? 'you' : event.creator.name || event.creator.email}
                </span>
                {(isMember || isCreator) && (
                  <span className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                    {isCreator ? 'Creator' : 'Member'}
                  </span>
                )}
              </div>
              
              {/* Description integrated */}
              {event.description && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 max-w-3xl">
                  {event.description}
                </p>
              )}
            </div>
            
            <div className="flex gap-3 ml-6">
              {(isMember || isCreator) && (
                <button 
                  onClick={handleDeleteEvent}
                  disabled={loading}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>{loading ? 'Deleting...' : 'Delete Event'}</span>
                </button>
              )}
              {!isMember && !isCreator && (
                <button 
                  onClick={handleJoinEvent}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? 'Joining...' : 'Join Event'}
                </button>
              )}
              {isMember && !isCreator && (
                <button 
                  onClick={handleLeaveEvent}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? 'Leaving...' : 'Leave Event'}
                </button>
              )}
            </div>
          </div>
          
          {/* Event Details Grid - Sleeker */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(event.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatTime(event.date)}</p>
              </div>
            </div>
            
            {event.location && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{event.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Members</p>
                <p className="font-semibold text-gray-900 dark:text-white">{event.members.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Section - Sleek */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Event Photos
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {photoCount === 0 ? 'No photos yet' : `${photoCount} photo${photoCount !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPhotoGallery(!showPhotoGallery)}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm transition-colors"
            >
              {showPhotoGallery ? 'Hide Photos' : 'Show Photos'}
            </button>
          </div>
        </div>

        {showPhotoGallery && (
          <div className="p-8">
            {/* Photo Upload for members and creators */}
            {(isMember || isCreator) && (
              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Upload New Photos
                  </h3>
                </div>
                <PhotoUpload 
                  eventId={event.id} 
                  onPhotoUploaded={handlePhotoUploaded}
                />
              </div>
            )}
            
            <PhotoGallery 
              eventId={event.id} 
              refreshTrigger={photoRefreshTrigger}
              onPhotoCountChange={setPhotoCount}
            />
          </div>
        )}
      </div>

      {/* Members Section - Sleek */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Members
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {event.members.length} {event.members.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {member.user.image ? (
                    <img 
                      src={member.user.image} 
                      alt={member.user.name || 'Member'} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {(member.user.name || member.user.email || 'M')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {member.userId === currentUserId ? 'You' : member.user.name || member.user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
