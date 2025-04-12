import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a custom type that includes the properties we need
type NotificationPermissionStatus = {
  status: Notifications.PermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
};

const NOTIFICATION_PERMISSION_KEY = 'notificationPermissionGranted';

export function useNotificationPermissions() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

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
    requestPermissions,
    checkPermissions,
  };
}
