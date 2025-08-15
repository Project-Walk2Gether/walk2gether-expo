import { WizardStep } from "../steps";
import { WalkTypeConfig } from "./base";

export const meetupWalkConfig: WalkTypeConfig = {
  type: "meetup",

  getSteps: (): WizardStep[] => [
    {
      key: "type",
      title: "Select walk type",
    },
    {
      key: "topic",
      title: "Select topic",
    },
    {
      key: "questionPrompts",
      title: "Question prompts",
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
    type: "meetup",
    durationMinutes: 30,
    minimumNumberOfMinutesWithEachPartner: 5,
    questionPrompts: [],
    topic: "", // Initialize with empty topic that will be filled in the topic step
  },
};
