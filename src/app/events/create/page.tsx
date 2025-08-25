'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserSuggestion {
  id: string;
  phone: string;
  name: string | null;
}

interface InvitedUser {
  phone: string;
  name: string | null;
}

export default function CreateEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: ''
  });
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [invitePhone, setInvitePhone] = useState('');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Debounce für die Nutzer-Suche
  useEffect(() => {
    const searchUsers = async () => {
      if (invitePhone.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(`/api/user/search?q=${encodeURIComponent(invitePhone)}`);
        const data = await response.json();
        
        if (response.ok) {
          setSuggestions(data.users || []);
          setShowSuggestions(data.users.length > 0);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [invitePhone]);

  // Klick außerhalb schließt Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        suggestionRef.current && !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: UserSuggestion) => {
    setInvitePhone(suggestion.phone);
    setShowSuggestions(false);
  };

  const handleAddInvite = () => {
    if (invitePhone.trim() && !invitedUsers.find(u => u.phone === invitePhone)) {
      // Finde den Namen aus den Suggestions oder nutze die eingegebene Nummer
      const suggestion = suggestions.find(s => s.phone === invitePhone);
      setInvitedUsers(prev => [...prev, { 
        phone: invitePhone,
        name: suggestion?.name || null
      }]);
      setInvitePhone('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleRemoveInvite = (phone: string) => {
    setInvitedUsers(prev => prev.filter(u => u.phone !== phone));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication required. Please log in again.');
        router.push('/auth/signin');
        return;
      }

      // Create date object (set to start of day if no time specified)
      const dateTime = new Date(formData.date);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          date: dateTime.toISOString(),
          location: formData.location,
          invitedUsers: invitedUsers.map(u => u.phone) // Füge eingeladene Nutzer hinzu
        }),
      });

      if (response.ok) {
        // Force a refresh of the events page when redirecting
        router.push('/events');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm sm:text-base">Back to Events</span>
            </button>
          </div>

          {/* Main Create Event Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Header Section */}
            <div className="p-4 sm:p-8 pb-3 sm:pb-6">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">
                  Create Event
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Plan your next amazing event
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="px-4 sm:px-8 pb-4 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Event Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Enter event name"
                  />
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm sm:text-base"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-sm sm:text-base"
                    placeholder="Describe your event..."
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Event location or 'Online'"
                  />
                </div>

                {/* Invite Users */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Nutzer einladen (optional)
                  </label>
                  
                  {/* Add User Input */}
                  <div className="relative mb-3">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          type="text"
                          value={invitePhone}
                          onChange={e => setInvitePhone(e.target.value)}
                          onFocus={() => setShowSuggestions(suggestions.length > 0)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInvite())}
                          placeholder="Telefonnummer oder Name eingeben"
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                        />
                        {searchLoading && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                        
                        {/* Dropdown mit Vorschlägen */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div 
                            ref={suggestionRef}
                            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                          >
                            {suggestions.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                type="button"
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {suggestion.name || 'Unbekannt'}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {suggestion.phone}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddInvite}
                        disabled={!invitePhone.trim()}
                        className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Invited Users List */}
                  {invitedUsers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Eingeladene Nutzer:</p>
                      <div className="flex flex-wrap gap-2">
                        {invitedUsers.map((user) => (
                          <div key={user.phone} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                            <span>{user.name || user.phone}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveInvite(user.phone)}
                              className="ml-1 text-blue-600 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                          <path fill="currentColor" className="opacity-75" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Creating...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="hidden sm:inline">Create Event</span>
                        <span className="sm:hidden">Create</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
