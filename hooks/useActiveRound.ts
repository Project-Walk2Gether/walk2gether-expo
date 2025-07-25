import { useQuery } from "@/utils/firestore";
import { useMemo } from "react";
import { collection, orderBy, query } from "@react-native-firebase/firestore";
import { Round, WithId } from "walk2gether-shared";
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { useAuth } from "@/context/AuthContext";

/**
 * Hook to fetch and manage the active round for a walk
 * @param walkRef Document reference to the walk
 * @param walkOwnerId The user ID of the walk owner
 * @returns Object containing active round and related data
 */
export function useActiveRound(walkRef: any, walkOwnerId?: string) {
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const isWalkOwner = currentUserId === walkOwnerId;
  
  // Query for rounds, ordered by startTime descending (newest first)
  const roundsQuery = useMemo(() => {
    if (!walkRef) return undefined;
    return query(
      collection(walkRef, "rounds"), 
      orderBy("startTime", "desc")
    );
  }, [walkRef]);

  const { docs: rounds } = useQuery(roundsQuery);
  const activeRound = useMemo(() => {
    return rounds?.[0] as WithId<Round> | undefined;
  }, [rounds]);
  
  // Find the current user's pair in the active round
  const userPair = useMemo(() => {
    if (!activeRound || !currentUserId) return undefined;
    return activeRound.pairs.find(pair => pair.userUids.includes(currentUserId));
  }, [activeRound, currentUserId]);
  
  /**
   * Syncs notifications for the active round if the current user is the walk owner
   */
  const syncRoundNotifications = async () => {
    // Only walk owners should receive round rotation notifications
    if (!isWalkOwner || !activeRound || !activeRound.endTime) return;
    
    try {
      // Cancel any existing notifications for this round
      await cancelRoundNotifications(activeRound.id);
      
      // Schedule a new notification for when the round ends
      const endTimeDate = activeRound.endTime.toDate();
      const currentTime = new Date();
      
      // Only schedule if the end time is in the future
      if (endTimeDate > currentTime) {
        const notificationId = await scheduleRoundEndNotification(
          activeRound.id,
          activeRound.roundNumber,
          endTimeDate
        );
        console.log(`Scheduled round end notification with ID: ${notificationId}`);
      }
    } catch (error) {
      console.error("Error syncing round notifications:", error);
    }
  };
  
  /**
   * Cancels notifications for a specific round
   */
  const cancelRoundNotifications = async (roundId: string) => {
    try {
      // Get all scheduled notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Filter for notifications related to this round
      const roundNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.roundId === roundId
      );
      
      // Cancel each notification
      for (const notification of roundNotifications) {
        if (notification.identifier) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error("Error cancelling round notifications:", error);
    }
  };
  
  /**
   * Schedules a notification for when a round ends
   */
  const scheduleRoundEndNotification = async (
    roundId: string, 
    roundNumber: number,
    endTime: Date
  ) => {
    // Extract walkId from the reference path
    const walkId = walkRef?.path?.split('/')?.[1] || '';    
    
    const notificationContent = {
      title: `Round ${roundNumber} is ending`,
      body: "It's time to rotate to the next round",
      data: { 
        roundId, 
        type: 'round_end',
        url: `/walks/${walkId}/details`
      },
    };
    
    // Use a DateTriggerInput that triggers exactly at the round's end time
    const trigger = {
      date: endTime, // This ensures the notification is triggered at the exact endTime
      channelId: 'round-notifications',
    };
    
    return await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger,
    });
  };
  
  // Return all the useful data and functions
  return {
    rounds,
    activeRound,
    userPair,
    syncRoundNotifications,
    cancelRoundNotifications,
  };
}
