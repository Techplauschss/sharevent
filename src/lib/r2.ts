import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn('R2 configuration is incomplete. Photo upload will not work.');
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
  // Add additional configuration for R2
  apiVersion: '2006-03-01',
});

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export async function uploadToR2(
  file: File,
  key: string,
  contentType: string
): Promise<UploadResult> {
  try {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      return {
        success: false,
        error: 'R2 configuration is missing. Please check environment variables.',
      };
    }

    console.log('Uploading to R2:', {
      bucket: R2_BUCKET_NAME,
      key,
      contentType,
      size: file.size
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
    });

    await r2Client.send(command);

    // Build public URL
    const publicUrl = R2_PUBLIC_URL 
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`;

    console.log('Upload successful, URL:', publicUrl);

    return {
      success: true,
      url: publicUrl,
      key,
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    console.error('R2 Config:', {
      accountId: R2_ACCOUNT_ID ? 'SET' : 'MISSING',
      accessKey: R2_ACCESS_KEY_ID ? 'SET' : 'MISSING',
      secretKey: R2_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
      bucket: R2_BUCKET_NAME || 'MISSING'
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    if (!R2_BUCKET_NAME) {
      console.error('R2_BUCKET_NAME is not configured');
      return false;
    }

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from R2:', error);
    return false;
  }
}

export function generatePhotoKey(eventId: string, filename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop();
  return `events/${eventId}/photos/${timestamp}-${randomString}.${extension}`;
}
