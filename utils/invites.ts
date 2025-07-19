/**
 * Utility functions for handling invitations
 */

/**
 * Generates a unique invite code
 * @returns A unique alphanumeric code
 */
export const generateInviteCode = async (): Promise<string> => {
  // Generate a random 6-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

/**
 * Validates an invite code
 * @param code The code to validate
 * @returns Whether the code is valid
 */
export const validateInviteCode = (code: string): boolean => {
  // Code should be 6 alphanumeric characters
  const regex = /^[A-Z0-9]{6}$/;
  return regex.test(code);
};

/**
 * Generates an invitation URL with appropriate query parameters
 * @param code Friend invitation code (optional)
 * @param walkCode Walk code (optional)
 * @returns A properly formatted invitation URL
 */
export const getInvitationUrl = (code?: string, walkCode?: string): string => {
  // Base URL
  const baseUrl = "https://projectwalk2gether.org/join";
  
  // Start building query params
  const params = new URLSearchParams();
  
  // Add parameters if they exist
  if (code) {
    params.append("code", code);
  }
  
  if (walkCode) {
    params.append("walk", walkCode);
  }
  
  // If we have any params, add them to the URL
  const queryString = params.toString();
  if (queryString) {
    return `${baseUrl}?${queryString}`;
  }
  
  // Return just the base URL if no params
  return baseUrl;
};
