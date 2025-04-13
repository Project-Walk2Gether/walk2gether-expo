import { auth } from "@/config/firebase";
import { Walk } from "walk2gether-shared";

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
 * Check if a walk is active (currently happening)
 * A walk is considered active if it is either:
 * 1. Explicitly marked as active via the active flag, OR
 * 2. Within the time window of when it should be active, with a 1-hour leeway on either side
 */
export function isActive(walk: Walk): boolean {
  // If explicitly marked active, return true
  if (walk.active) return true;
  
  // If no date, can't determine if it's active based on time
  if (!walk.date) return false;
  
  const walkDate = walk.date.toDate();
  const now = new Date();
  
  // Duration in minutes, with a default of 60 minutes if not specified
  const durationMinutes = walk.durationMinutes || 60;
  
  // Calculate the end time (walk start time + duration)
  const walkEndTime = new Date(walkDate.getTime() + durationMinutes * 60 * 1000);
  
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
 * Placeholder for round and pair functionality - update based on actual Walk structure
 * 
 * These functions are meant to be used with a different walk structure that includes rounds.
 * For now, we're keeping them as safe stubs to prevent errors.
 */
export function currentRound(walk: Walk) {
  // Safely check if rounds exists on the Walk type
  return (walk as any).rounds?.[(walk as any).rounds?.length - 1];
}

/**
 * Get the current user's pair in a round - safe version
 */
export function userPair(round: any) {
  if (!round || !auth.currentUser) return null;
  return round.pairs?.find((pair: any) => pair.userUids?.includes(auth.currentUser?.uid));
}
