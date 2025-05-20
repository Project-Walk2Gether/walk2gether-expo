import * as Localization from "expo-localization";

export const timezone = Localization.timezone;

/**
 * Combines a date-only and a time-only Date object into a single Date in the user's local timezone.
 * @param dateOnly JS Date object (year, month, day are used; time is ignored)
 * @param timeOnly JS Date object (hours, minutes are used; date is ignored)
 * @returns Combined JS Date object in local time
 */
export function combineDateAndTime(dateOnly: Date, timeOnly: Date): Date {
  return new Date(
    dateOnly.getFullYear(),
    dateOnly.getMonth(),
    dateOnly.getDate(),
    timeOnly.getHours(),
    timeOnly.getMinutes(),
    0,
    0
  );
}
