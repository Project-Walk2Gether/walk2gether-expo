import { auth_instance, firestore_instance } from "@/config/firebase";
import {
  addDoc,
  collection,
  doc,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import * as BackgroundFetch from "expo-background-fetch";
import * as ExpoLocation from "expo-location";
import * as TaskManager from "expo-task-manager";
import { writeLogIfEnabled } from "../utils/logging";

// Define a task name for background location tracking
export const LOCATION_TRACKING_TASK = "background-location-tracking";

// Task options interface
interface LocationTaskOptions extends ExpoLocation.LocationTaskOptions {
  walkId?: string;
  userId?: string;
  extraFields?: Record<string, any>;
}

// Define the background task for location tracking
TaskManager.defineTask(
  LOCATION_TRACKING_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<any>) => {
    if (error) {
      console.error("Background location error:", error);
      return;
    }
    if (data) {
      // Extract location data
      const { locations } = data as {
        locations: ExpoLocation.LocationObject[];
      };
      const location = locations[0];

      // Get the task options containing walkId and userId
      let taskOptions: LocationTaskOptions = {};
      try {
        // Get options that were passed when the task was started
        taskOptions = (await TaskManager.getTaskOptionsAsync(
          LOCATION_TRACKING_TASK
        )) as LocationTaskOptions;
      } catch (e) {
        console.error("Error getting task options:", e);
      }

      const { walkId, userId, extraFields = {} } = taskOptions;

      // Use auth instance if userId isn't available in options
      const uid = userId; //|| auth_instance.currentUser?.uid;

      if (uid && walkId) {
        try {
          // Create a timestamp for this location update
          const timestamp = Timestamp.now();

          // Create a new location document in the locations subcollection
          const locationsCollectionRef = collection(
            firestore_instance,
            `walks/${walkId}/participants/${uid}/locations`
          );

          // Prepare location data according to the schema
          const locationData = {
            // Basic location data matching LocationType schema
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            createdAt: timestamp,
            updatedAt: timestamp,
            timestamp, // Additional field for the timestamp of this specific ping
            // Additional references to connect this location with the walk and participant
            walkId,
            participantId: uid,
          };

          // Add the new location document
          await addDoc(locationsCollectionRef, locationData);

          // Also update the lastLocation field for backward compatibility
          const participantDocRef = doc(
            firestore_instance,
            `walks/${walkId}/participants/${uid}`
          );
          await updateDoc(participantDocRef, {
            lastLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp,
            },
            ...extraFields,
          });
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (err) {
          console.error("Error updating location in background:", err);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      }
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }
);

// Helper functions for background location tracking
export const startBackgroundLocationTracking = async ({
  walkId,
  userId,
  extraFields = {},
  ...locationOptions
}: LocationTaskOptions = {}) => {
  if (!walkId) {
    console.error("Cannot start background tracking without walkId");
    return false;
  }

  // Get userId from auth if not provided
  const uid = userId || auth_instance.currentUser?.uid;
  if (!uid) {
    console.error("Cannot start background tracking without user ID");
    return false;
  }

  const defaultOptions: LocationTaskOptions = {
    accuracy: ExpoLocation.Accuracy.Balanced,
    timeInterval: 15000, // Update every 15 seconds to save battery
    distanceInterval: 10, // Update if moved by 10 meters
    deferredUpdatesInterval: 30000, // 30 seconds
    deferredUpdatesDistance: 50, // 50 meters
    foregroundService: {
      notificationTitle: "Walk2gether is tracking your location",
      notificationBody:
        "This allows others to see your location during the walk",
      notificationColor: "#FF5E0E", // Use primary color
    },
    pausesUpdatesAutomatically: false,
    activityType: ExpoLocation.ActivityType.Fitness,
    showsBackgroundLocationIndicator: true,
    // Store these values to access in the background task
    walkId,
    userId: uid,
    extraFields,
  };

  await writeLogIfEnabled({
    message: "Starting background location tracking for walkId: " + walkId,
  });

  await ExpoLocation.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
    ...defaultOptions,
    ...locationOptions,
  });

  return true;
};

export const stopBackgroundLocationTracking = async () => {
  if (await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK)) {
    await ExpoLocation.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    return true;
  }
  return false;
};

export default {
  LOCATION_TRACKING_TASK,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
};
