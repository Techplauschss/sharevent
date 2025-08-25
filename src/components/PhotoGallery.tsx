'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import { getDisplayName } from '@/lib/user-utils';
import { getProxiedImageUrl, isR2Url } from '@/lib/image-utils';

interface EventPhoto {
  id: string;
  eventId: string;
  uploaderId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  r2Key: string;
  caption: string | null;
  createdAt: string;
  uploader: {
    id: string;
    name: string | null;
    phone: string | null;
    image: string | null;
  };
}

interface PhotoGalleryProps {
  eventId: string;
  refreshTrigger?: number;
  onPhotoCountChange?: (count: number) => void;
}

export function PhotoGallery({ eventId, refreshTrigger, onPhotoCountChange }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [downloadingPhoto, setDownloadingPhoto] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/photos`);
      if (response.ok) {
        const data = await response.json();
        console.log('PhotoGallery fetched data:', data);
        setPhotos(data.photos);
        // Update photo count in parent component
        onPhotoCountChange?.(data.photos.length);
      } else {
        console.error('Failed to fetch photos, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [eventId, refreshTrigger]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Download function for images
  const downloadImage = async (url: string, filename: string, photoId?: string) => {
    if (photoId) {
      setDownloadingPhoto(photoId);
    }
    
    try {
      // Use our download API to handle CORS and force download
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading image via download API:', error);
      
      // Fallback: Try using image proxy API
      try {
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (proxyError) {
        console.error('Error downloading image via proxy:', proxyError);
        
        // Final fallback: Open image in new tab for manual download
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      if (photoId) {
        setDownloadingPhoto(null);
      }
    }
  };

  // Convert photos to lightbox format
  const lightboxSlides = photos.map((photo) => ({
    src: photo.url, // Use direct R2 URL
    alt: photo.caption || photo.originalName,
    width: 1200, // Default width
    height: 800, // Default height
    // Additional metadata
    title: photo.caption || photo.originalName,
    description: `Uploaded by ${getDisplayName(photo.uploader)} on ${formatDate(photo.createdAt)}`,
    // Download configuration
    download: {
      url: photo.url,
      filename: photo.originalName || `photo-${photo.id}.jpg`
    }
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No photos yet
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Be the first to share a photo from this event!
        </p>
      </div>
    );
  }

  // Debug info
  console.log('PhotoGallery total photos:', photos.length);
  photos.forEach((photo, i) => {
    console.log(`Photo ${i}:`, photo.url);
  });

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => {
          const imageUrl = photo.url;
          
          return (
            <div
              key={photo.id}
              className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 group cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <div
                className="w-full h-full"
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || photo.originalName}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    console.log('Gallery image loaded successfully:', photo.url);
                  }}
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
              </div>
              
              {/* Download Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(photo.url, photo.originalName || `photo-${photo.id}.jpg`, photo.id);
                }}
                disabled={downloadingPhoto === photo.id}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                title="Download Image"
              >
                {downloadingPhoto === photo.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modern Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        plugins={[Download]}
        carousel={{
          padding: 0,
          spacing: 0,
          imageFit: "contain",
        }}
        render={{
          buttonPrev: photos.length <= 1 ? () => null : undefined,
          buttonNext: photos.length <= 1 ? () => null : undefined,
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          closeOnPullUp: true,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
        }}
        download={{
          download: async ({ slide }) => {
            if (typeof slide.download === 'object' && slide.download?.url && slide.download?.filename) {
              await downloadImage(slide.download.url, slide.download.filename);
            }
          }
        }}
      />
    </>
  );
}
