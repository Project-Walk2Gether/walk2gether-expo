/**
 * Utility functions for communication (SMS, Email, etc.)
 */
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

/**
 * Opens the device's SMS app with the provided phone number and message
 * @param phoneNumber The recipient's phone number
 * @param message The message to send
 */
export const sendSMS = async (phoneNumber: string, message: string): Promise<void> => {
  let smsUrl = '';
  
  // Different URL schemes for iOS and Android
  if (Platform.OS === 'ios') {
    // iOS uses sms: scheme
    smsUrl = `sms:${phoneNumber}&body=${encodeURIComponent(message)}`;
  } else {
    // Android uses smsto: scheme
    smsUrl = `smsto:${phoneNumber}?body=${encodeURIComponent(message)}`;
  }
  
  // Check if the device can handle the SMS URL
  const canOpen = await Linking.canOpenURL(smsUrl);
  
  if (canOpen) {
    await Linking.openURL(smsUrl);
  } else {
    console.error("Can't open SMS app");
    throw new Error("Can't open SMS app");
  }
};
