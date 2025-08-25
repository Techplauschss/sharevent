"use client";

import { useState } from 'react';
import { getDisplayName } from '@/lib/user-utils';
import { PhotoGallery } from './PhotoGallery';
import { PhotoUpload } from './PhotoUpload';
import { ConfirmModal } from './ConfirmModal';

// Formular-Komponente zum Hinzufügen eines Members per Telefonnummer
function AddMemberForm({ eventId }: { eventId: string }) {
  // Kontakte auswählen (Web Contacts API)
  const handlePickContact = async () => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        // Nur Felder, die wir brauchen
        const props = ['tel', 'name'];
        // Nur eine Auswahl zulassen
        const opts = { multiple: false };
  // Web Contacts API ist experimentell, daher cast auf 'any'
  const contacts: any = await (navigator as any).contacts.select(props, opts);
        if (contacts && contacts.length > 0 && contacts[0].tel && contacts[0].tel.length > 0) {
          setPhone(contacts[0].tel[0]);
        }
      } catch (err) {
        setError('Kontakt konnte nicht ausgewählt werden');
      }
    } else {
      setError('Dein Browser unterstützt das Kontakte-Feature nicht');
    }
  };
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/events/${eventId}/add-member`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone }),
      });
      const result = await response.json();
      if (response.ok) {
        setSuccess('Nummer erfolgreich hinzugefügt!');
        setPhone('');
        window.location.reload();
      } else {
        setError(result.error || 'Fehler beim Hinzufügen');
      }
    } catch (err) {
      setError('Netzwerkfehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleAddMember} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Telefonnummer hinzufügen"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePickContact}
              className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
            >
              📱 Kontakt
            </button>
            <button
              type="submit"
              disabled={loading || !phone}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {loading ? 'Hinzufügen...' : 'Hinzufügen'}
            </button>
          </div>
        </div>
        {error && <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>}
        {success && <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">{success}</div>}
      </form>
    </div>
  );
}

interface EventDetailsEvent {
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
  photos?: Array<{
    id: string
    url: string
    createdAt: string
    filename: string
  }>
}

interface EventDetailsProps {
  event: EventDetailsEvent;
  isCreator: boolean;
  isMember: boolean;
}

export function EventDetails({ event, isCreator, isMember }: EventDetailsProps) {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(true);
  const [photoCount, setPhotoCount] = useState(0);
  const [photoRefreshTrigger, setPhotoRefreshTrigger] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const handleJoinEvent = async () => {
    if (isMember) return;
    
    setLoading(true);
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/events/${event.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    setShowLeaveModal(true);
  };

  const confirmLeaveEvent = async () => {
    setShowLeaveModal(false);
    setLoading(true);
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/events/${event.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    <div className="max-w-5xl mx-auto space-y-1">
      {/* Main Event Card - Sleek Design */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 pb-6">
          <div className="flex flex-col mb-6">
            <div className="flex justify-between items-start mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {event.name}
              </h1>
              
              <div className="flex gap-3 ml-6 flex-shrink-0">
                {(isMember || isCreator) && (
                  <button 
                    onClick={handleDeleteEvent}
                    disabled={loading}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="md:inline hidden">{loading ? 'Deleting...' : 'Delete Event'}</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center flex-wrap gap-2 text-gray-600 dark:text-gray-400 mb-1 w-full">
              {(isMember || isCreator) && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                  {isCreator ? 'Creator' : 'Member'}
                </span>
              )}
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                {new Date(event.date).toLocaleDateString('de-DE', {
                  day: '2-digit', 
                  month: '2-digit',
                  year: '2-digit'
                })}
              </span>
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                {event.members.length} {event.members.length === 1 ? 'Member' : 'Members'}
              </span>
            </div>
            
            {/* Description integrated */}
            {event.description && (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 max-w-3xl">
                {event.description}
              </p>
            )}
            
            <div className="flex gap-3 flex-wrap mt-2">
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
        </div>

        {/* Photos Section - Sleek */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800">
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Members
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.members.length} {event.members.length === 1 ? 'member' : 'members'}
                  </p>
                </div>
                {(isCreator || isMember) && (
                  <button
                    type="button"
                    className="ml-1 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                    onClick={() => setShowAddMemberForm(v => !v)}
                    aria-label="Nummer hinzufügen"
                  >
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
              {(isCreator || isMember) && showAddMemberForm && (
                <div className="w-full">
                  <AddMemberForm eventId={event.id} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.members.map((member, index) => (
              <div key={`member-${index}`} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {member.user.image ? (
                    <img 
                      src={member.user.image} 
                      alt={member.user.name || 'Member'} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {getDisplayName(member.user)[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {getDisplayName(member.user)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    Member
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteEvent}
        title="Event löschen"
        message={`Möchtest du wirklich das Event "${event.name}" löschen?\n\nDies löscht dauerhaft:\n- Das Event\n- Alle Event-Fotos\n- Alle Mitglieder-Zuordnungen\n\nDiese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Event löschen"
        cancelText="Abbrechen"
        isDangerous={true}
      />

      {/* Leave Event Confirmation Modal */}
      <ConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={confirmLeaveEvent}
        title="Event verlassen"
        message={`Möchtest du wirklich das Event "${event.name}" verlassen?\n\nDu wirst aus der Mitgliederliste entfernt und erhältst keine Updates mehr zu diesem Event.`}
        confirmText="Event verlassen"
        cancelText="Abbrechen"
        isDangerous={true}
      />
    </div>
  );
}
