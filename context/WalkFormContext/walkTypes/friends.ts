import { WalkTypeConfig } from "./base";
import { WizardStep } from "../steps";

export const friendsWalkConfig: WalkTypeConfig = {
  type: "friends",
  
  getSteps: (): WizardStep[] => [
    {
      key: "type",
      title: "Select walk type",
    },
    {
      key: "time",
      title: "Select date and time",
    },
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
  ],
  
  defaultValues: {
    type: "friends",
    durationMinutes: 30,
  },
};
