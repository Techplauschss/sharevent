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
              <svg className="animate-spin h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mb-2 sm:mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
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
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <svg 
                  className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                  Add Event Photos
                </h3>
              </div>
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
