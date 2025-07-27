import { WizardStep } from "../steps";
import { WalkTypeConfig } from "./base";

export const virtualWalkConfig: WalkTypeConfig = {
  type: "virtual",

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
    type: "virtual",
    durationMinutes: 30,
    minimumNumberOfMinutesWithEachPartner: 5,
    rounds: [],
    // Virtual walks don't need a physical location
    isVirtual: true,
  },
};
