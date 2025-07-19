import React, { createContext, ReactNode, useContext } from "react";
import { MeetupWalk, Participant, Walk, WithId } from "walk2gether-shared";

interface WalkContextType {
  walk: WithId<Walk | MeetupWalk> | null;
  participants: WithId<Participant>[] | null;
  goBack: () => void;
  currentUserParticipantDoc: WithId<Participant> | undefined;
  isLoadingParticipants: boolean;
}

const WalkContext = createContext<WalkContextType>(undefined as any);

interface WalkProviderProps {
  children: ReactNode;
  walk: WithId<Walk | MeetupWalk> | null;
  goBack: () => void;
  participants: WithId<Participant>[] | null;
  currentUserParticipantDoc: WithId<Participant> | undefined;
  isLoadingParticipants: boolean;
}

export const WalkProvider = ({
  children,
  walk,
  goBack,
  participants,
  currentUserParticipantDoc,
  isLoadingParticipants,
}: WalkProviderProps) => {
  return (
    <WalkContext.Provider
      value={{
        walk,
        goBack,
        participants,
        currentUserParticipantDoc,
        isLoadingParticipants,
      }}
    >
      {children}
    </WalkContext.Provider>
  );
};

export const useWalk = () => {
  const context = useContext(WalkContext);
  if (context === undefined) {
    throw new Error("useWalk must be used within a WalkProvider");
  }
  return context;
};
