import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore_instance } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, updateDoc } from '@react-native-firebase/firestore';

// Define a custom type that includes the properties we need
type NotificationPermissionStatus = {
  status: Notifications.PermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
};

const NOTIFICATION_PERMISSION_KEY = 'notificationPermissionGranted';

export function useNotificationPermissions() {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Register for push notifications and get token
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Save token to Firebase if user is logged in
        if (user) {
          saveTokenToFirebase(token);
        }
      }
    });

    // Set up notification handler
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [user?.uid]);

  useEffect(() => {
    checkPermissions();
  }, []);

  // Save token to Firebase
  const saveTokenToFirebase = async (token: string) => {
    if (!user) return;
    
    try {
      const userRef = doc(firestore_instance, `users/${user.uid}`);
      await updateDoc(userRef, {
        expoPushToken: token,
        deviceInfo: {
          platform: Platform.OS,
          model: Device.modelName,
          osVersion: Platform.Version,
          lastUpdated: new Date()
        }
      });
      console.log('Push token saved to Firebase');
    } catch (error) {
      console.error('Error saving push token to Firebase:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      setLoading(true);
      
      // Get the current device permission status
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus({
        status,
        granted: status === 'granted',
        canAskAgain: true
      });
      
      // If permission is granted, store it for future reference
      if (status === 'granted') {
        await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);
      
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      
      // Update state with new status
      setPermissionStatus({
        status,
        granted: status === 'granted',
        canAskAgain: true
      });
      
      // Store the permission status
      if (status === 'granted') {
        await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
      }
      
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    permissionStatus,
    loading,
    expoPushToken,
    requestPermissions,
    checkPermissions,
  };
}

// Function to register for push notifications and get token
async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get the token that uniquely identifies this device
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '7b384d5a-3e2e-4c79-895f-30255a67819a', // Your Expo project ID
      });
      token = tokenData.data;
      console.log('Push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
