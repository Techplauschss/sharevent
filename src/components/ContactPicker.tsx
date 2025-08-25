'use client';

import React, { useState } from 'react';

interface ContactPickerProps {
  onContactsSelected?: (contacts: any[]) => void;
}

export const ContactPicker: React.FC<ContactPickerProps> = ({ 
  onContactsSelected 
}) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feature Detection
  React.useEffect(() => {
    const checkSupport = () => {
      // Prüfe ob Contact Picker API unterstützt wird
      const supported = 'contacts' in navigator && 'ContactsManager' in window;
      setIsSupported(supported);
    };

    checkSupport();
  }, []);

  // Contact Picker öffnen
  const openContactPicker = async () => {
    if (!isSupported) {
      setError('Contact Picker wird auf diesem Gerät nicht unterstützt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Definiere welche Eigenschaften du haben möchtest
      const props = ['name', 'email', 'tel'];
      
      // Optionen: mehrere Kontakte auswählbar
      const opts = { multiple: true };

      // @ts-ignore - TypeScript kennt die API noch nicht vollständig
      const contacts = await navigator.contacts.select(props, opts);
      
      console.log('Ausgewählte Kontakte:', contacts);
      
      // Hier würdest du normalerweise etwas mit den Kontakten machen
      if (onContactsSelected) {
        onContactsSelected(contacts);
      }
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Nutzer hat Auswahl abgebrochen');
      } else {
        console.error('Fehler beim Öffnen des Contact Pickers:', err);
        setError('Fehler beim Zugriff auf Kontakte');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verfügbare Eigenschaften prüfen
  const checkAvailableProperties = async () => {
    if (!isSupported) return;

    try {
      // @ts-ignore
      const availableProps = await navigator.contacts.getProperties();
      console.log('Verfügbare Eigenschaften:', availableProps);
    } catch (err) {
      console.error('Fehler beim Prüfen der Eigenschaften:', err);
    }
  };

  // UI rendern
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Contact Picker</h3>
      
      {/* Support Status */}
      <div className="mb-4">
        <p className="text-sm">
          Status: {
            isSupported === null ? 'Prüfe...' :
            isSupported ? '✅ Unterstützt' : '❌ Nicht unterstützt'
          }
        </p>
        {isSupported === false && (
          <p className="text-sm text-yellow-600 mt-2">
            📱 Contact Picker funktioniert nur auf Android-Geräten mit Chrome/Edge
          </p>
        )}
      </div>

      {/* Fehler anzeigen */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={checkAvailableProperties}
          disabled={!isSupported}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Verfügbare Eigenschaften prüfen
        </button>
        
        <button
          onClick={openContactPicker}
          disabled={!isSupported || isLoading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Öffne Contact Picker...' : '📱 Kontakte auswählen'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-600">
        <p>💡 Der Contact Picker:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Funktioniert nur auf Android mit Chrome/Edge</li>
          <li>Benötigt HTTPS</li>
          <li>Nutzer behält volle Kontrolle</li>
          <li>Keine persistente Berechtigung</li>
        </ul>
      </div>
    </div>
  );
};

export default ContactPicker;
