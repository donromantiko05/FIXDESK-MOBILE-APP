import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { storage } from './config';

/**
 * Request camera permissions and take a photo
 */
export const takePhotoWithCamera = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission is required to take photos.');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });

  if (result.canceled || !result.assets || !result.assets.length) {
    return null;
  }

  return result.assets[0].uri;
};

/**
 * Request photo library permissions and pick an image
 */
export const pickImageFromLibrary = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Photo library permission is required to select photos.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });

  if (result.canceled || !result.assets || !result.assets.length) {
    return null;
  }

  return result.assets[0].uri;
};

/**
 * Upload local file URI to Firebase Storage and return download URL.
 * Gracefully falls back to local URI if offline.
 */
export const uploadImageToFirebase = async (uri, folder = 'tickets') => {
  if (!uri) return null;

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${folder}/${Date.now()}_${randomId}.jpg`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Storage upload failed, using local URI:', error?.message);
    }
    // Fall back to local URI so user experience isn't interrupted
    return uri;
  }
};
