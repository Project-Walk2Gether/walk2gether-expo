import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Platform } from "react-native";
import { Walk, WithId } from "walk2gether-shared";

// Create a channel for Android notifications
export const createNotificationChannel = () => {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("walk-reminders", {
      name: "Walk Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
    });
  }
};

/**
 * Configure notifications for the app
 */
export const configureNotifications = () => {
  // Create the Android notification channel
  createNotificationChannel();

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

/**
 * Schedule a walk reminder notification
 * @param walk Walk to schedule notification for
 * @returns Promise with notification ID if successful
 */
export const scheduleWalkReminder = async (
  walk: WithId<Walk>
): Promise<string | null> => {
  try {
    // Ensure we have a valid date
    if (!walk.date || !walk.date.toDate) {
      console.warn(
        "Walk missing valid date, cannot schedule notification",
        walk.id
      );
      return null;
    }

    const walkDate = walk.date.toDate();
    const reminderTime = new Date(walkDate.getTime() - 10 * 60 * 1000); // 10 minutes before

    // Don't schedule if reminder time is in the past
    if (reminderTime <= new Date()) {
      console.log(`Reminder time for walk ${walk.id} is in the past, skipping`);
      return null;
    }

    // Calculate the trigger seconds from now
    const triggerSeconds = Math.floor(
      (reminderTime.getTime() - Date.now()) / 1000
    );

    const walkName = walk.organizerName
      ? `${walk.organizerName}'s walk`
      : "Your walk";

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Walk Reminder",
        body: `${walkName} starts in 10 minutes!`,
        data: { walkId: walk.id },
        sound: true,
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        channelId: Platform.OS === "android" ? "walk-reminders" : undefined,
        seconds: triggerSeconds,
      },
    });

    console.log(`Scheduled notification ${notificationId} for walk ${walk.id}`);
    return notificationId;
  } catch (error) {
    console.error("Error scheduling walk reminder notification:", error);
    return null;
  }
};

/**
 * Cancel a scheduled notification
 * @param notificationId ID of the notification to cancel
 */
export const cancelNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Canceled notification ${notificationId}`);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
};

/**
 * Sync walk reminders for a collection of walks
 * This will schedule notifications for upcoming walks that are within the next 24 hours
 * @param walks Array of upcoming walks
 * @returns Object mapping walk IDs to their notification IDs
 */
export const syncWalkReminders = async (
  walks: WithId<Walk>[]
): Promise<Record<string, string>> => {
  try {
    // Get all scheduled notifications
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    // Create a map of walk IDs to notification IDs
    const existingNotifications: Record<string, string> = {};
    scheduledNotifications.forEach((notification) => {
      const walkId = notification.content.data?.walkId;
      if (walkId) {
        existingNotifications[walkId as string] = notification.identifier;
      }
    });

    // Track the new notification mappings
    const notificationMap: Record<string, string> = {};

    // Get current date/time
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter walks to those happening in the next 24 hours
    const upcomingWalksWithin24h = walks.filter((walk) => {
      if (!walk.date || !walk.date.toDate) return false;
      const walkDate = walk.date.toDate();
      return walkDate > now && walkDate <= tomorrow;
    });

    // Schedule notifications for filtered walks
    await Promise.all(
      upcomingWalksWithin24h.map(async (walk) => {
        // If notification already exists for this walk, keep it
        if (existingNotifications[walk.id]) {
          notificationMap[walk.id] = existingNotifications[walk.id];
          // Remove from existing notifications to track which ones to cancel
          delete existingNotifications[walk.id];
          return;
        }

        // Schedule new notification
        const notificationId = await scheduleWalkReminder(walk);
        if (notificationId) {
          notificationMap[walk.id] = notificationId;
        }
      })
    );

    // Cancel notifications for walks that no longer exist or are past
    await Promise.all(
      Object.values(existingNotifications).map((notificationId) =>
        cancelNotification(notificationId)
      )
    );

    console.log(
      `Synced notifications for ${upcomingWalksWithin24h.length} upcoming walks`
    );
    return notificationMap;
  } catch (error) {
    console.error("Error syncing walk reminders:", error);
    return {};
  }
};
