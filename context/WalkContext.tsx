import React, { createContext, useContext, ReactNode } from "react";
import { MeetupWalk, Walk, WithId, Participant } from "walk2gether-shared";

interface WalkContextType {
  walk: WithId<Walk | MeetupWalk> | null;
  participants: WithId<Participant>[] | null;
  participantDoc: WithId<Participant> | undefined;
  isLoadingParticipants: boolean;
}

const WalkContext = createContext<WalkContextType>({
  walk: null,
  participants: null,
  participantDoc: undefined,
  isLoadingParticipants: false,
});

interface WalkProviderProps {
  children: ReactNode;
  walk: WithId<Walk | MeetupWalk> | null;
  participants: WithId<Participant>[] | null;
  participantDoc: WithId<Participant> | undefined;
  isLoadingParticipants: boolean;
}

export const WalkProvider = ({
  children,
  walk,
  participants,
  participantDoc,
  isLoadingParticipants,
}: WalkProviderProps) => {
  return (
    <WalkContext.Provider
      value={{
        walk,
        participants,
        participantDoc,
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
