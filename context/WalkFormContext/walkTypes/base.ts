import { WizardStep } from "../steps";
import { Walk } from "walk2gether-shared";

export interface WalkTypeConfig {
  // The type of walk
  type: Walk["type"];
  
  // The steps for this walk type
  getSteps: (showHowItWorks?: boolean) => WizardStep[];
  
  // Default values for this walk type
  defaultValues: Partial<Walk>;
}
