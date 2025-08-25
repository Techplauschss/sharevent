'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/ConfirmModal';

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  phoneVerified: Date | null;
  createdEventsCount: number;
  memberOfEventsCount: number;
  photosCount: number;
  createdEvents: Array<{ id: string; name: string }>;
  memberOfEvents: Array<{ id: string; name: string }>;
}

interface EditableUser extends AdminUser {
  isEdited: boolean;
  originalName: string;
  originalPhone: string;
}

interface AdminData {
  users: AdminUser[];
  totalUsers: number;
  usersWithPhone: number;
  usersWithoutPhone: number;
  verifiedUsers: number;
}

const ADMIN_PHONE = '015153352436';

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [editableUsers, setEditableUsers] = useState<EditableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', phone: '' });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string; userName: string }>({
    isOpen: false,
    userId: '',
    userName: ''
  });

  useEffect(() => {
    // Check authentication using the existing localStorage system
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      router.push('/auth/signin');
      return;
    }

    try {
      // Decode phone number from token (existing system)
      const phone = atob(token);
      setUserPhone(phone);
      
      // Check if user has admin privileges
      if (phone !== ADMIN_PHONE) {
        router.push('/');
        return;
      }
      
      setIsAuthenticated(true);
      fetchAdminData(phone);
    } catch (error) {
      console.error('Failed to decode token:', error);
      router.push('/auth/signin');
    }
  }, [router]);

  const fetchAdminData = async (phone: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?phone=${encodeURIComponent(phone)}`);
      
      if (!response.ok) {
        throw new Error('Unauthorized access');
      }

      const result = await response.json();
      setData(result);
      
      // Initialize editable users
      const editableUsers: EditableUser[] = result.users.map((user: AdminUser) => ({
        ...user,
        isEdited: false,
        originalName: user.name,
        originalPhone: user.phone,
      }));
      setEditableUsers(editableUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleUserEdit = (userId: string, field: 'name' | 'phone', value: string) => {
    setEditableUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const updatedUser = { ...user, [field]: value };
        // Check if user has been edited
        const isEdited = updatedUser.name !== user.originalName || 
                        updatedUser.phone !== user.originalPhone;
        return { ...updatedUser, isEdited };
      }
      return user;
    }));
  };

  const handleSaveChanges = async () => {
    const changedUsers = editableUsers.filter(user => user.isEdited);
    
    if (changedUsers.length === 0) {
      setSaveMessage('Keine Änderungen zum Speichern vorhanden.');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setSaveLoading(true);
    setSaveMessage(null);
    setError(null);

    try {
      const updates = changedUsers.map(user => ({
        id: user.id,
        name: user.name.trim(),
        phone: user.phone === 'Keine Nummer' ? null : user.phone,
      }));

      const response = await fetch(`/api/admin/users?phone=${encodeURIComponent(userPhone)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Speichern');
      }

      setSaveMessage(result.message || 'Änderungen erfolgreich gespeichert!');
      
      // Refresh data
      await fetchAdminData(userPhone);
      
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Änderungen');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const confirmDeleteUser = async () => {
    const { userId } = deleteModal;
    
    setDeleteLoading(userId);
    setError(null);
    setSaveMessage(null);
    setDeleteModal({ isOpen: false, userId: '', userName: '' });

    try {
      const response = await fetch(`/api/admin/users?phone=${encodeURIComponent(userPhone)}&id=${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Löschen');
      }

      setSaveMessage(result.message || 'Benutzer erfolgreich gelöscht!');
      
      // Refresh data
      await fetchAdminData(userPhone);
      
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Benutzers');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.phone.trim()) {
      setError('Telefonnummer ist erforderlich');
      return;
    }

    if (!newUser.name.trim()) {
      setError('Name ist erforderlich');
      return;
    }

    setAddLoading(true);
    setError(null);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/admin/users?phone=${encodeURIComponent(userPhone)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUser.name.trim(),
          phone: newUser.phone.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Hinzufügen');
      }

      setSaveMessage(result.message || 'Benutzer erfolgreich hinzugefügt!');
      setNewUser({ name: '', phone: '' });
      setShowAddForm(false);
      
      // Refresh data
      await fetchAdminData(userPhone);
      
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Benutzers');
    } finally {
      setAddLoading(false);
    }
  };

  const hasChanges = editableUsers.some(user => user.isEdited);

  const filteredUsers = editableUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!isAuthenticated || userPhone !== ADMIN_PHONE) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h1>
          <p className="text-gray-600">Sie haben keine Berechtigung für diese Seite.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Fehler</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => fetchAdminData(userPhone)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Übersicht aller registrierten Benutzer
          </p>
        </div>

        {/* Statistics */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gesamt</h3>
              <p className="text-2xl font-bold text-blue-600">{data.totalUsers}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mit Telefon</h3>
              <p className="text-2xl font-bold text-green-600">{data.usersWithPhone}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ohne Telefon</h3>
              <p className="text-2xl font-bold text-orange-600">{data.usersWithoutPhone}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verifiziert</h3>
              <p className="text-2xl font-bold text-purple-600">{data.verifiedUsers}</p>
            </div>
          </div>
        )}

        {/* Add User Form */}
        <div className="mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Neuen Benutzer hinzufügen</span>
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Neuen Benutzer hinzufügen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Name eingeben"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefonnummer *
                  </label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Telefonnummer eingeben"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddUser}
                  disabled={addLoading || !newUser.phone.trim() || !newUser.name.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {addLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Hinzufügen...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Hinzufügen</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewUser({ name: '', phone: '' });
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Nach Name oder Telefonnummer suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Telefonnummer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Erstelle Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mitglied in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fotos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${user.isEdited ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) => handleUserEdit(user.id, 'name', e.target.value)}
                        className={`text-sm font-medium bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full ${
                          user.isEdited ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-900 dark:text-white'
                        }`}
                        placeholder="Name eingeben"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={user.phone}
                        onChange={(e) => handleUserEdit(user.id, 'phone', e.target.value)}
                        className={`text-sm bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full ${
                          user.isEdited ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-900 dark:text-white'
                        }`}
                        placeholder="Telefonnummer eingeben"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.phoneVerified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {user.phoneVerified ? 'Verifiziert' : 'Nicht verifiziert'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.createdEventsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.memberOfEventsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.photosCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        disabled={deleteLoading === user.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                      >
                        {deleteLoading === user.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-800 dark:border-red-400 mr-1"></div>
                            Löschen...
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Löschen
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Messages */}
        {(saveMessage || error) && (
          <div className="mb-4">
            {saveMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {saveMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || saveLoading}
            className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2 ${
              hasChanges && !saveLoading
                ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {saveLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Speichere...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>
                  {hasChanges 
                    ? `Änderungen speichern (${editableUsers.filter(u => u.isEdited).length})`
                    : 'Keine Änderungen'
                  }
                </span>
              </>
            )}
          </button>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Keine Benutzer gefunden, die Ihren Suchkriterien entsprechen.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: '', userName: '' })}
        onConfirm={confirmDeleteUser}
        title="Benutzer löschen"
        message={`Sind Sie sicher, dass Sie "${deleteModal.userName}" löschen möchten?\n\nDiese Aktion kann nicht rückgängig gemacht werden und löscht auch alle verknüpften Events, Fotos und Mitgliedschaften.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        isDangerous={true}
      />
    </div>
  );
}
