import { startNextRound } from "@/utils/roundUtils";
import firestore from "@react-native-firebase/firestore";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { MeetupWalk, Walk, walkIsMeetupWalk } from "walk2gether-shared";

const ROUND_ROTATION_TASK = "ROUND_ROTATION_TASK";

// Define the background task
TaskManager.defineTask(ROUND_ROTATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Round rotation task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }

  try {
    console.log("Round rotation task executing...");

    // Get the walkId from the task data
    const { walkId } = data as { walkId: string };

    if (!walkId) {
      console.error("No walkId provided to round rotation task");
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    // Get the walk document
    const walkDoc = await firestore().doc(`walks/${walkId}`).get();
    const walk = walkDoc.data() as Walk;

    if (!walk || !walkIsMeetupWalk(walk)) {
      console.log("Walk not found or not a meetup walk, cancelling task");
      await unregisterRoundRotationTask();
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const meetupWalk = walk as MeetupWalk;

    // Check if walk is still active and has upcoming rounds
    if (!walk.startedAt || walk.endTime || !meetupWalk.upcomingRounds?.length) {
      console.log(
        "Walk is not active or has no upcoming rounds, cancelling task"
      );
      await unregisterRoundRotationTask();
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Start the next round
    await startNextRound({ ...walk, _ref: walkDoc.ref } as any);

    // Schedule the next rotation if there are more rounds
    await syncRoundRotationTask(walkId);

    console.log("Round rotation completed successfully");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Round rotation task failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Sync the round rotation task - schedule for the next round or clear if no more rounds
 */
export async function syncRoundRotationTask(walkId: string): Promise<void> {
  try {
    // First, unregister any existing task
    await unregisterRoundRotationTask();

    // Get the walk document
    const walkDoc = await firestore().doc(`walks/${walkId}`).get();
    const walk = walkDoc.data() as Walk;

    if (!walk || !walkIsMeetupWalk(walk)) {
      console.log("Walk not found or not a meetup walk");
      return;
    }

    const meetupWalk = walk as MeetupWalk;

    // Check if walk is active and has upcoming rounds
    if (!walk.startedAt || walk.endTime || !meetupWalk.upcomingRounds?.length) {
      console.log("Walk is not active or has no upcoming rounds");
      return;
    }

    // Get the next round timing
    const nextRound = meetupWalk.upcomingRounds[0];
    if (!nextRound.startTime) {
      console.log("Next round has no start time");
      return;
    }

    // Calculate when to start the next round
    const nextRoundStartTime = nextRound.startTime.toDate();
    const now = new Date();
    const timeUntilNextRound = nextRoundStartTime.getTime() - now.getTime();

    // Only schedule if the round is in the future
    if (timeUntilNextRound <= 0) {
      console.log(
        "Next round should have already started, starting immediately"
      );
      await startNextRound({ ...walk, _ref: walkDoc.ref } as any);
      // Recursively sync for the next round
      await syncRoundRotationTask(walkId);
      return;
    }

    // Register the background task
    await BackgroundFetch.registerTaskAsync(ROUND_ROTATION_TASK, {
      minimumInterval: Math.max(timeUntilNextRound / 1000, 15), // At least 15 seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log(
      `Round rotation task scheduled for ${nextRoundStartTime.toISOString()}`
    );
  } catch (error) {
    console.error("Failed to sync round rotation task:", error);
  }
}

/**
 * Unregister the round rotation background task
 */
export async function unregisterRoundRotationTask(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      ROUND_ROTATION_TASK
    );
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(ROUND_ROTATION_TASK);
      console.log("Round rotation task unregistered");
    }
  } catch (error) {
    console.error("Failed to unregister round rotation task:", error);
  }
}

/**
 * Check if the round rotation task is currently registered
 */
export async function isRoundRotationTaskRegistered(): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(ROUND_ROTATION_TASK);
  } catch (error) {
    console.error("Failed to check round rotation task status:", error);
    return false;
  }
}

/**
 * Get the status of the round rotation task
 */
export async function getRoundRotationTaskStatus(): Promise<any> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      ROUND_ROTATION_TASK
    );
    if (!isRegistered) {
      return { registered: false };
    }

    const status = await BackgroundFetch.getStatusAsync();
    return {
      registered: true,
      status: status,
    };
  } catch (error) {
    console.error("Failed to get round rotation task status:", error);
    return {
      registered: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
