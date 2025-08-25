'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PhotoUploadProps {
  eventId: string;
  onPhotoUploaded?: () => void;
}

export function PhotoUpload({ eventId, onPhotoUploaded }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{fileName: string; progress: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Convert FileList to Array
    const fileArray = Array.from(files);
    
    // Validate all files first
    const invalidFiles = fileArray.filter(file => 
      !allowedTypes.includes(file.type) || file.size > maxSize
    );
    
    if (invalidFiles.length > 0) {
      setError(`Invalid files detected. Only JPEG, PNG, and WebP images up to 10MB are allowed.`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(fileArray.map(file => ({ fileName: file.name, progress: 0 })));

    try {
      // Upload files one by one to track progress
      let successCount = 0;
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Update progress for current file
        setUploadProgress(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, progress: 50 } : item
          )
        );

        const formData = new FormData();
        formData.append('photo', file);

        // Get auth token from localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication required');
          break;
        }

        const response = await fetch(`/api/events/${eventId}/photos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          successCount++;
          // Mark as completed
          setUploadProgress(prev => 
            prev.map((item, index) => 
              index === i ? { ...item, progress: 100 } : item
            )
          );
        } else {
          const errorData = await response.json();
          setError(errorData.error || `Failed to upload ${file.name}`);
          break;
        }
      }

      if (successCount > 0) {
        console.log(`${successCount} photo(s) uploaded successfully`);
        onPhotoUploaded?.();
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Clear progress after a short delay
        setTimeout(() => {
          setUploadProgress([]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-3 sm:p-6 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2 sm:mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 mb-2 sm:mb-4 text-sm sm:text-base">
                Uploading {uploadProgress.length} photo{uploadProgress.length !== 1 ? 's' : ''}...
              </p>
              
              {/* Progress List - Mobile Optimized */}
              <div className="w-full max-w-sm space-y-1 sm:space-y-2">
                {uploadProgress.map((item, index) => (
                  <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-1 sm:mb-2">
                      <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                        {item.fileName}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {item.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <svg 
                className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-2 sm:mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 16l4-4m0 0l-4-4m4 4H4m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v12z" 
                />
              </svg>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Add Event Photos
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">
                <span className="hidden sm:inline">Drag and drop multiple images here, or </span>
                <span className="sm:hidden">Tap to select photos or </span>
                <span>click to select</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline">Supports JPEG, PNG, WebP up to 10MB each</span>
                <span className="sm:hidden">JPEG, PNG, WebP (max 10MB)</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
