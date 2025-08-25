'use client';

import { useState, useRef } from 'react';

interface QuickPhotoUploadProps {
  eventId: string;
  onPhotoUploaded?: () => void;
  disabled?: boolean;
}

export function QuickPhotoUpload({ eventId, onPhotoUploaded, disabled }: QuickPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`/api/events/${eventId}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onPhotoUploaded?.();
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
      
      <button
        onClick={openFileDialog}
        disabled={disabled || isUploading}
        className={`p-2 rounded-full transition-all ${
          disabled || isUploading
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white'
        }`}
        title={disabled ? 'Join event to upload photos' : 'Quick photo upload'}
      >
        {isUploading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </>
  );
}
