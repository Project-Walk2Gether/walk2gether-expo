import { Participant, Walk } from "walk2gether-shared";
import { isActive, isFuture, isPast } from "../../../utils/walkUtils";

interface Args {
  walk: Walk;
  participants: Participant[];
}

export const peopleCountText = ({ walk, participants }: Args) => {
  let peopleText = "";
  const count = participants.length;
  if (isActive(walk)) {
    peopleText = `${count} ${count === 1 ? "person" : "people"} walking`;
  } else if (isFuture(walk)) {
    peopleText = `${count} ${count === 1 ? "person" : "people"} going`;
  } else if (isPast(walk)) {
    peopleText = `${count} ${count === 1 ? "person" : "people"} joined`;
  } else {
    peopleText = `${count} ${count === 1 ? "person" : "people"}`;
  }
  return peopleText;
};
