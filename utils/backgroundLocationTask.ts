import { doc, updateDoc } from '@react-native-firebase/firestore';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { firestore_instance } from '../config/firebase';

// Define a task name for background location tracking
export const LOCATION_TRACKING_TASK = 'background-location-tracking';

// Global variables for background tracking
declare global {
  var currentUser: any;
  var currentWalkId: string;
}

// Define the background task for location tracking
TaskManager.defineTask(
  LOCATION_TRACKING_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<any>) => {
    if (error) {
      console.error('Background location error:', error);
      return;
    }
    if (data) {
      // Extract location data
      const { locations } = data as { locations: Location.LocationObject[] };
      const location = locations[0];

      // Get the current user and walk ID from storage
      // We use global variables since task manager runs outside React context
      const currentUser = (global as any).currentUser;
      const currentWalkId = (global as any).currentWalkId;

      if (currentUser && currentWalkId) {
        try {
          // Update the location in Firestore
          const participantDocRef = doc(
            firestore_instance,
            `walks/${currentWalkId}/participants/${currentUser.uid}`
          );
          await updateDoc(participantDocRef, {
            lastLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: new Date().getTime(),
            },
          });
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (err) {
          console.error('Error updating location in background:', err);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      }
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }
);

// Helper functions for background location tracking
export const startBackgroundLocationTracking = async (
  options: Location.LocationTaskOptions = {}
) => {
  const defaultOptions: Location.LocationTaskOptions = {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 15000, // Update every 15 seconds to save battery
    distanceInterval: 10, // Update if moved by 10 meters
    deferredUpdatesInterval: 30000, // 30 seconds
    deferredUpdatesDistance: 50, // 50 meters
    foregroundService: {
      notificationTitle: 'Walk2gether is tracking your location',
      notificationBody: 'This allows others to see your location during the walk',
      notificationColor: '#FF5E0E', // Use primary color
    },
    pausesUpdatesAutomatically: false,
    activityType: Location.ActivityType.Fitness,
    showsBackgroundLocationIndicator: true,
  };

  await Location.startLocationUpdatesAsync(
    LOCATION_TRACKING_TASK, 
    { ...defaultOptions, ...options }
  );
  
  return true;
};

export const stopBackgroundLocationTracking = async () => {
  if (await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK)) {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    return true;
  }
  return false;
};

// Export the task registration for side effects
export const registerBackgroundTask = () => {
  // This function doesn't need to do anything, as the task is registered
  // when this file is imported due to the side effect of TaskManager.defineTask
  console.log('Background location task registered:', LOCATION_TRACKING_TASK);
};

export default {
  LOCATION_TRACKING_TASK,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
  registerBackgroundTask,
};
