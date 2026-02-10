import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import imageCompression from 'browser-image-compression';
import { generateId } from './utils';
import { LIMITS } from './constants';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: LIMITS.IMAGE_COMPRESSED_SIZE_MB,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
}

export async function uploadPostImage(userId: string, file: File): Promise<string> {
  // Validate file size
  if (file.size > LIMITS.IMAGE_MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image too large. Maximum size is ${LIMITS.IMAGE_MAX_SIZE_MB}MB.`);
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Unsupported file type. Please use JPG, PNG, or HEIC.');
  }

  // Compress the image
  const compressedFile = await compressImage(file);

  // Generate unique filename
  const fileId = generateId();
  const extension = file.name.split('.').pop() || 'jpg';
  const filePath = `posts/${userId}/${fileId}.${extension}`;

  // Upload to Firebase Storage
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, compressedFile);

  // Get download URL
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  // Validate file size (smaller limit for profile photos)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image too large. Maximum size is 5MB.');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Unsupported file type. Please use JPG, PNG, or HEIC.');
  }

  // Compress for profile photo (smaller size)
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 500,
    useWebWorker: true
  });

  // Generate filename
  const extension = file.name.split('.').pop() || 'jpg';
  const filePath = `profiles/${userId}/profile.${extension}`;

  // Upload to Firebase Storage
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, compressedFile);

  // Get download URL
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}
