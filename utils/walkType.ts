import { Walk } from "walk2gether-shared";

export const getWalkTypeLabel = (walkType: Walk["type"]) => {
  switch (walkType) {
    case "friends":
      return "Friend Walk";
    case "neighborhood":
      return "Neighborhood Walk";
    default:
      return "Walk";
  }
};
