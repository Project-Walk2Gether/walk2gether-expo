import { format, isThisWeek, isToday, isTomorrow } from "date-fns";

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
