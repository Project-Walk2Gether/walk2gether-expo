import { locationService } from "@/utils/locationService";
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
  endTime?: Date; // The date/time when tracking should automatically stop
}

// Define the background task for location tracking
TaskManager.defineTask(
  LOCATION_TRACKING_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<any>) => {
    console.log("BACKGROUND TASK STARTED", new Date().toISOString());
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK).then(
      (isRegistered) => {
        console.log("Task is registered:", isRegistered);
      }
    );

    writeLogIfEnabled({
      message: "Background location task started",
      metadata: { data },
    });
    if (error) {
      writeLogIfEnabled({
        message: "Error updating location in background: " + error,
      });
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
        console.log("Task options retrieved:", JSON.stringify(taskOptions));
        
        // Check if tracking should be stopped based on endTime
        if (taskOptions.endTime) {
          const endTime = new Date(taskOptions.endTime);
          const now = new Date();
          
          if (now > endTime) {
            console.log("Background tracking has reached its end time, stopping...");
            await writeLogIfEnabled({
              message: "Stopping background location tracking because endTime has passed",
            });
            await stopBackgroundLocationTracking();
            return BackgroundFetch.BackgroundFetchResult.NoData;
          }
        }
      } catch (e) {
        console.error("Error getting task options:", e);
      }

      console.log("Sending background location");

      const { walkId, userId } = taskOptions;

      console.log({ walkId, userId });

      // Use auth instance if userId isn't available in options
      const uid = userId; //|| auth_instance.currentUser?.uid;

      if (uid && walkId) {
        try {
          // Log before calling location service
          console.log("About to call locationService with:", {
            walkId,
            userId: uid,
            coords: location.coords,
          });

          // Use the centralized location service to update location
          // This handles both the location history and lastLocation update
          await locationService.updateLocation(walkId, uid, location);
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (err) {
          writeLogIfEnabled({
            message: "Error updating location in background: " + err,
          });
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
  ...locationOptions
}: LocationTaskOptions = {}) => {
  console.log("Starting background tracking with:", { walkId, userId, endTime: locationOptions.endTime });

  if (!walkId) {
    console.error("Cannot start background tracking without walkId");
    return false;
  }

  // Get userId from auth if not provided
  if (!userId) {
    console.error("Cannot start background tracking without user ID");
    return false;
  }
  
  // Log the end time if provided
  if (locationOptions.endTime) {
    console.log("Background tracking will automatically stop at:", locationOptions.endTime);
  }

  const defaultOptions: LocationTaskOptions = {
    accuracy: ExpoLocation.Accuracy.High,
    timeInterval: 10000, // Update every 10 seconds
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
    userId,
  };

  await writeLogIfEnabled({
    message: "Starting background location tracking for walkId: " + walkId,
  });

  // Check if task is already registered
  const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(
    LOCATION_TRACKING_TASK
  );
  console.log("Is task already registered before starting?", isTaskRegistered);

  await ExpoLocation.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
    ...defaultOptions,
    ...locationOptions,
  });

  // Verify task was registered successfully
  const isRegisteredAfter = await TaskManager.isTaskRegisteredAsync(
    LOCATION_TRACKING_TASK
  );
  console.log(
    "Task registered after startLocationUpdatesAsync:",
    isRegisteredAfter
  );

  return true;
};

export const stopBackgroundLocationTracking = async () => {
  console.log("Attempting to stop background tracking");
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    LOCATION_TRACKING_TASK
  );
  console.log("Is task registered before stopping?", isRegistered);

  if (isRegistered) {
    await ExpoLocation.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    console.log("Background tracking stopped successfully");
    return true;
  }
  console.log("No background tracking task found to stop");
  return false;
};

export default {
  LOCATION_TRACKING_TASK,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
};
