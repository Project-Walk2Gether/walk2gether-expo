import { Walk } from "walk2gether-shared";
import { WalkTypeConfig } from "./base";
import { WizardStep } from "../steps";
import { friendsWalkConfig } from "./friends";
import { neighborhoodWalkConfig } from "./neighborhood";
import { meetupWalkConfig } from "./meetup";

// Export all walk type configurations
export { friendsWalkConfig } from "./friends";
export { neighborhoodWalkConfig } from "./neighborhood";
export { meetupWalkConfig } from "./meetup";
export type { WalkTypeConfig } from "./base";

// Map of all walk type configurations by type
export const walkTypeConfigs: Record<string, WalkTypeConfig> = {
  friends: friendsWalkConfig,
  neighborhood: neighborhoodWalkConfig,
  meetup: meetupWalkConfig,
};

/**
 * Get the walk type configuration for a specific walk type
 */
export function getWalkTypeConfig(type: Walk["type"] | undefined): WalkTypeConfig {
  // Default to friends walk if type is undefined
  const walkType = type || "friends";
  return walkTypeConfigs[walkType];
}

/**
 * Get the wizard steps for a specific walk type
 */
export function getStepsForWalkType(type: Walk["type"] | undefined, showHowItWorks = false): WizardStep[] {
  // Default to friends walk if type is undefined
  const walkType = type || "friends";
  return walkTypeConfigs[walkType].getSteps(showHowItWorks);
}

/**
 * Get the default values for a specific walk type
 */
export function getDefaultValuesForWalkType(type: Walk["type"] | undefined): Partial<Walk> {
  // Default to friends walk if type is undefined
  const walkType = type || "friends";
  return walkTypeConfigs[walkType].defaultValues;
}
