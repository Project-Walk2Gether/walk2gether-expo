import * as TaskManager from "expo-task-manager";
import { writeLogIfEnabled } from "./logging";
import { 
  LOCATION_TRACKING_TASK, 
  stopBackgroundLocationTracking 
} from "@/background/backgroundLocationTask";

/**
 * Checks if background location tracking tasks are running and terminates them
 * if there are no active walks.
 * 
 * This function should be called on app startup and when the walk status changes
 * to ensure we're not tracking location unnecessarily.
 * 
 * @param activeWalksCount The number of currently active walks for the user
 * @returns Promise<boolean> True if background task was found and stopped, false otherwise
 */
export const syncBackgroundLocationTracking = async (
  activeWalksCount: number
): Promise<boolean> => {
  try {
    // Check if there's an active background location task
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(
      LOCATION_TRACKING_TASK
    );
    
    // If tracking is active but there are no active walks, stop tracking
    if (isTaskRegistered && activeWalksCount === 0) {
      await writeLogIfEnabled({
        message: "Background location task cleanup: Found active tracking with no active walks",
      });
      
      console.log("Stopping background location tracking due to no active walks");
      await stopBackgroundLocationTracking();
      return true;
    } else if (isTaskRegistered) {
      console.log(`Background location task is running with ${activeWalksCount} active walks`);
    } else {
      console.log("No background location tasks running");
    }
    
    return false;
  } catch (error) {
    console.error("Error in syncBackgroundLocationTracking:", error);
    return false;
  }
};
