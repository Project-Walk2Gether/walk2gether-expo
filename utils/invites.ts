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
