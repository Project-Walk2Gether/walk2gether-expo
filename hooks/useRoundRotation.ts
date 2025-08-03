import {
  syncRoundRotationTask,
  unregisterRoundRotationTask,
} from "@/background/roundRotationTask";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";
import { MeetupWalk, Walk, walkIsMeetupWalk, WithId } from "walk2gether-shared";

/**
 * Hook to manage automatic round rotation for walk owners
 * This hook will:
 * - Sync the background task when the walk starts or rounds change
 * - Clean up the task when the walk ends or component unmounts
 * - Only activate for walk owners of meetup walks
 */
export function useRoundRotation(walk: WithId<Walk | MeetupWalk> | null) {
  const { user } = useAuth();
  const lastSyncRef = useRef<string>("");

  // Check if current user is the walk owner
  const isWalkOwner = walk && user && walk.createdByUid === user.uid;

  useEffect(() => {
    // Only walk owners should manage round rotation
    if (!isWalkOwner || !walk || !walkIsMeetupWalk(walk)) {
      return;
    }

    const meetupWalk = walk as MeetupWalk;

    // Create a sync key based on walk state to detect changes
    const syncKey = `${
      walk.id
    }-${walk.startedAt?.toMillis()}-${walk.endTime?.toMillis()}-${
      meetupWalk.upcomingRounds?.length || 0
    }`;

    // Only sync if something has changed
    if (lastSyncRef.current === syncKey) {
      return;
    }

    lastSyncRef.current = syncKey;

    // Sync the round rotation task
    const syncTask = async () => {
      try {
        if (
          walk.startedAt &&
          !walk.endTime &&
          meetupWalk.upcomingRounds?.length
        ) {
          console.log("Syncing round rotation task for walk:", walk.id);
          await syncRoundRotationTask(walk.id);
        } else {
          console.log("Unregistering round rotation task for walk:", walk.id);
          await unregisterRoundRotationTask();
        }
      } catch (error) {
        console.error("Failed to sync round rotation task:", error);
      }
    };

    syncTask();
  }, [isWalkOwner, walk]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isWalkOwner) {
        unregisterRoundRotationTask().catch(console.error);
      }
    };
  }, [isWalkOwner]);

  return {
    isWalkOwner,
    isRoundRotationActive: isWalkOwner && walk?.startedAt && !walk?.endTime,
  };
}
