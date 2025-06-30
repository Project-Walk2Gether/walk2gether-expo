import * as Localization from "expo-localization";

export const timezone = Localization.timezone;

/**
 * Combines a date-only and a time-only Date object into a single Date in the user's local timezone.
 * @param dateOnly JS Date object (year, month, day are used; time is ignored)
 * @param timeOnly JS Date object (hours, minutes are used; date is ignored)
 * @returns Combined JS Date object in local time
 */
export function combineDateAndTime(dateOnly: Date, timeOnly: Date): Date {
  // Extract date components using local time methods to avoid timezone issues
  const dateStr = dateOnly.toISOString().split('T')[0]; // YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
  
  // Extract time components
  const hours = timeOnly.getHours();
  const minutes = timeOnly.getMinutes();
  
  // Log the extracted components for debugging
  console.log('Date components extracted:', {
    dateStr,
    year,
    month: month - 1, // JavaScript months are 0-indexed
    day,
    hours,
    minutes
  });
  
  // Create a new date using the extracted components
  // Note: month is 0-indexed in JavaScript Date constructor
  const result = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  console.log('combineDateAndTime result:', {
    inputDate: dateOnly.toISOString(),
    inputTime: timeOnly.toISOString(),
    result: result.toISOString(),
    localString: result.toString()
  });
  
  return result;
}
