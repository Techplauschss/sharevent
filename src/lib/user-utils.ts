/**
 * Utility functions for user data management
 */

// Event to notify components when username changes
export const USER_NAME_UPDATED_EVENT = 'userNameUpdated';

/**
 * Get the saved username for a phone number from localStorage
 * Falls back to provided name or phone number if no saved name exists
 */
export function getSavedUserName(phone: string | null, fallbackName?: string | null): string {
  if (typeof window === 'undefined' || !phone) {
    // Server-side rendering or no phone - return fallback
    return fallbackName || phone || 'Unknown';
  }

  try {
    const savedName = localStorage.getItem(`userName_${phone}`);
    if (savedName && savedName.trim()) {
      return savedName.trim();
    }
  } catch (error) {
    console.warn('Failed to get saved username:', error);
  }

  // Return fallback name or phone number
  return fallbackName || phone;
}

/**
 * Save a username for a phone number to localStorage AND database
 */
export async function saveUserName(phone: string, name: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (name && name.trim()) {
      // Save to localStorage first (immediate feedback)
      localStorage.setItem(`userName_${phone}`, name.trim());
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent(USER_NAME_UPDATED_EVENT, { 
        detail: { phone, name: name.trim() } 
      }));

      // Save to database (for other users to see)
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('/api/user/update-name', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: name.trim() })
          });

          if (!response.ok) {
            console.warn('Failed to save name to database:', await response.text());
          }
        } catch (error) {
          console.warn('Failed to save name to database:', error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to save username:', error);
  }
}

/**
 * Get the display name for a user, prioritizing saved names
 * Priority: 1. Local saved name, 2. Database name, 3. Phone number
 */
export function getDisplayName(user: { name?: string | null; phone: string | null }): string {
  if (!user.phone) {
    return user.name || 'Unknown';
  }
  
  // First try to get locally saved name (highest priority for current user)
  const localName = getSavedUserName(user.phone, null);
  if (localName && localName !== user.phone) {
    return localName;
  }
  
  // Then use database name (visible to all users)
  if (user.name && user.name.trim()) {
    return user.name.trim();
  }
  
  // Fallback to phone number
  return user.phone;
}

/**
 * Hook to listen for username updates
 */
export function useUserNameUpdates(callback: (phone: string, name: string) => void) {
  if (typeof window !== 'undefined') {
    const handler = (event: CustomEvent) => {
      callback(event.detail.phone, event.detail.name);
    };
    
    window.addEventListener(USER_NAME_UPDATED_EVENT, handler as EventListener);
    
    return () => {
      window.removeEventListener(USER_NAME_UPDATED_EVENT, handler as EventListener);
    };
  }
  
  return () => {};
}
