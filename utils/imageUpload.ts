import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import storage from '@react-native-firebase/storage';
import { Attachment } from 'walk2gether-shared';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import uuid from 'react-native-uuid';

// Request permission to access the camera and photo library
export const requestImagePermission = async () => {
  if (Platform.OS !== 'web') {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      return false;
    }
    return true;
  }
  return true;
};

// Process and resize an image to reduce storage size
export const processImage = async (uri: string) => {
  try {
    const processed = await manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );
    return processed.uri;
  } catch (error) {
    console.error('Error processing image:', error);
    return uri; // Return original if processing fails
  }
};

export type ImagePickerOption = 'camera' | 'library' | 'multiple';

// Pick image(s) from camera or library
export const pickImage = async (option: ImagePickerOption): Promise<ImagePicker.ImagePickerAsset[]> => {
  const hasPermission = await requestImagePermission();
  if (!hasPermission) return [];

  try {
    let result;
    if (option === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      // For library or multiple options
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: option !== 'multiple', // Only allow editing for single image
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: option === 'multiple',
      });
    }

    if (!result.canceled) {
      return result.assets;
    }
    return [];
  } catch (error) {
    console.error('Error picking image:', error);
    return [];
  }
};

// Upload an image to Firebase Storage
export const uploadImage = async (uri: string, path: string): Promise<string> => {
  try {
    // Process the image before uploading
    const processedUri = await processImage(uri);
    
    // Create a reference to the storage location
    const reference = storage().ref(path);
    
    // Upload the file
    await reference.putFile(processedUri);
    
    // Get the download URL
    const downloadURL = await reference.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Upload multiple images and return Attachment objects
export const uploadMessageAttachments = async (
  assets: ImagePicker.ImagePickerAsset[],
  storagePathPrefix: string
): Promise<Attachment[]> => {
  if (!assets.length) return [];
  
  try {
    const attachments: Attachment[] = [];
    
    // Upload each image and create attachment objects
    const uploadPromises = assets.map(async (asset) => {
      const attachmentId = uuid.v4().toString();
      const storagePath = `${storagePathPrefix}/${attachmentId}.jpg`;
      
      const uri = await uploadImage(asset.uri, storagePath);
      
      attachments.push({
        uri,
        storagePath,
        type: 'image',
        contentType: asset.mimeType || 'image/jpeg',
        metadata: {
          width: asset.width,
          height: asset.height,
        },
      });
    });
    
    await Promise.all(uploadPromises);
    return attachments;
  } catch (error) {
    console.error('Error uploading message attachments:', error);
    throw error;
  }
};
