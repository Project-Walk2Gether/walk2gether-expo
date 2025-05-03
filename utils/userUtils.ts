/**
 * Extracts up to two initials from a name string.
 * For single-word names, returns the first letter capitalized.
 * For multi-word names, returns the first letter of the first two words capitalized.
 * 
 * @param name - The name to extract initials from
 * @param fallback - A fallback string to return if name is empty or undefined
 * @returns The extracted initials or the fallback string
 */
export function getInitials(name?: string, fallback = '?'): string {
  if (!name || name.trim() === '') {
    return fallback;
  }

  // Split the name by spaces and filter out empty parts
  const nameParts = name.split(' ').filter(part => part.trim() !== '');
  
  if (nameParts.length === 0) {
    return fallback;
  }
  
  // Get the first letter of the first part
  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  
  // If there's a second part, get its first letter
  if (nameParts.length > 1) {
    const secondInitial = nameParts[1].charAt(0).toUpperCase();
    return `${firstInitial}${secondInitial}`;
  }
  
  // Otherwise just return the first initial
  return firstInitial;
}
