import { auth_instance } from "@/config/firebase";
import { addMinutes } from "date-fns";
import { Timestamp } from "@react-native-firebase/firestore";
import { Walk } from "walk2gether-shared";

export const isOwner = (walk: Walk) => {
  return walk.createdByUid === auth_instance.currentUser?.uid;
};

/**
 * Check if a walk is in the future
 * A walk is in the future if it hasn't started yet and is not active
 */
export function isFuture(walk: Walk): boolean {
  // If walk is already active, it's not in the future
  if (isActive(walk)) return false;

  if (!walk.date) return false;

  const walkDate = walk.date.toDate();
  const now = new Date();

  // The walk is in the future if its start time is after now
  // We use the raw start time without leeway here to avoid overlapping with isActive
  const leewayMs = 60 * 60 * 1000; // 1 hour in milliseconds
  const earliestActiveTime = new Date(walkDate.getTime() - leewayMs);

  return now < earliestActiveTime;
}

/**
 * Calculate the estimated end time for a walk
 * End time = start time + duration + 1 hour buffer
 * 
 * @param walk The walk to calculate end time for
 * @param bufferMinutes Optional buffer in minutes (defaults to 60)
 * @returns A Date object representing the estimated end time
 */
export function getEstimatedEndTime(walk: Walk, bufferMinutes: number = 60): Date {
  const date = walk.date || walk.startedAt;
  if (!date) {
    return new Date(); // Fallback to current time if no date is available
  }

  const walkDate = date.toDate();
  // Duration in minutes, with a default of 60 minutes if not specified
  const durationMinutes = walk.durationMinutes || 60;
  
  // If there's already an estimatedEndTime, use that
  if (walk.estimatedEndTime) {
    return walk.estimatedEndTime.toDate();
  }

  // Otherwise calculate: start time + duration + buffer
  return addMinutes(walkDate, durationMinutes + bufferMinutes);
}

/**
 * Creates a Firestore Timestamp from a walk's estimated end time
 * 
 * @param walk The walk to generate the timestamp for
 * @param bufferMinutes Optional buffer in minutes (defaults to 60)
 * @returns A Firestore Timestamp for the estimated end time
 */
export function getEstimatedEndTimeTimestamp(walk: Walk, bufferMinutes: number = 60): Timestamp {
  const endTime = getEstimatedEndTime(walk, bufferMinutes);
  return Timestamp.fromDate(endTime);
}

/**
 * Check if a walk is active (currently happening)
 * A walk is considered active if it is either:
 * 1. Explicitly marked as active via the active flag, OR
 * 2. Within the time window of when it should be active, with a 1-hour leeway on either side
 */
export function isActive(walk: Walk): boolean {
  // If no date, can't determine if it's active based on time
  const date = walk.date || walk.startedAt;
  if (!date) return false;

  const walkDate = date.toDate();
  const now = new Date();

  // Use the estimated end time helper function
  const walkEndTime = getEstimatedEndTime(walk, 0); // No buffer for active check

  // Add 1 hour leeway on either side
  const leewayMs = 60 * 60 * 1000; // 1 hour in milliseconds
  const earliestActiveTime = new Date(walkDate.getTime() - leewayMs);
  const latestActiveTime = new Date(walkEndTime.getTime() + leewayMs);

  // Walk is active if current time is between (start time - 1 hour) and (end time + 1 hour)
  return now >= earliestActiveTime && now <= latestActiveTime;
}

/**
 * Check if a walk is in the past
 * A walk is in the past if it has ended and is not active
 */
export function isPast(walk: Walk): boolean {
  // If walk is active, it's not in the past
  if (isActive(walk)) return false;

  // If it's in the future, it's not in the past
  if (isFuture(walk)) return false;

  // If we're here, it's neither active nor in the future, so it must be in the past
  return true;
}

/**
 * Get the status of a walk as a string: "active", "past", or "future"
 * @param walk The walk to check
 * @returns A string representing the walk's status
 */
export function getWalkStatus(walk: Walk): "active" | "past" | "future" {
  if (isActive(walk)) return "active";
  if (isPast(walk)) return "past";
  return "future";
}
