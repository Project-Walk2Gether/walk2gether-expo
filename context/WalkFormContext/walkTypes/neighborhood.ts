import { WalkTypeConfig } from "./base";
import { WizardStep } from "../steps";

export const neighborhoodWalkConfig: WalkTypeConfig = {
  type: "neighborhood",
  
  getSteps: (showHowItWorks = false): WizardStep[] => {
    const baseSteps = [
      {
        key: "type",
        title: "Select walk type",
      },
    ];
    
    const howItWorksStep = showHowItWorks ? [
      {
        key: "howItWorks",
        title: "How it works",
      },
    ] : [];
    
    const remainingSteps = [
      {
        key: "location",
        title: "Select start point",
      },
      {
        key: "duration",
        title: "Set duration",
      },
      {
        key: "invite",
        title: "Invite",
      },
      {
        key: "quote",
        title: "You're all set!",
      },
    ];
    
    return [...baseSteps, ...howItWorksStep, ...remainingSteps];
  },
  
  defaultValues: {
    type: "neighborhood",
    durationMinutes: 30,
  },
};
