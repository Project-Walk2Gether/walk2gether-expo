import { format, isThisWeek, isToday, isTomorrow, differenceInSeconds } from "date-fns";

/**
 * Format a date intelligently based on when it is
 * - For today: Just the time (e.g., "3:30 PM")
 * - For tomorrow: "Tomorrow at 3:30 PM"
 * - For this week: Day name and time (e.g., "Friday at 3:30 PM")
 * - For dates further out: Date and time (e.g., "May 30 at 3:30 PM")
 *
 * @param date The date to format
 * @returns A user-friendly string representation of the date
 */
export function getSmartDateFormat(date: Date): string {
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  } else if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, "h:mm a")}`;
  } else if (isThisWeek(date)) {
    return `${format(date, "EEEE")} at ${format(date, "h:mm a")}`;
  } else {
    return `${format(date, "MMM d")} at ${format(date, "h:mm a")}`;
  }
}

/**
 * Format the time left between two dates as a countdown string (MM:SS)
 * 
 * @param currentDate The current date
 * @param targetDate The target date to count down to
 * @returns A string in the format "MM:SS"
 */
export function formatTimeLeft(currentDate: Date, targetDate: Date): string {
  const diffInSeconds = differenceInSeconds(targetDate, currentDate);
  
  if (diffInSeconds <= 0) {
    return "00:00";
  }
  
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;
  
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
