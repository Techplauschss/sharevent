/**
 * Generates a proxied URL for R2 images to avoid CORS issues
 */
export function getProxiedImageUrl(r2Url: string): string {
  return `/api/proxy-image?url=${encodeURIComponent(r2Url)}`;
}

/**
 * Checks if an URL is an R2 URL that might need proxying
 */
export function isR2Url(url: string): boolean {
  return url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com');
}
