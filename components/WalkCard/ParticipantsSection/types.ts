import { Participant, Walk, WithId } from "walk2gether-shared";

export interface ParticipantsSectionProps {
  walk: WithId<Walk>;
  currentUserUid?: string;
}

export interface ParticipantData {
  approvedParticipants: WithId<Participant>[];
  pendingParticipants: WithId<Participant>[];
  approvedCount: number;
  pendingCount: number;
  unapprovedCount: number;
  avatarsToDisplay: WithId<Participant>[];
  overflow: number;
}
