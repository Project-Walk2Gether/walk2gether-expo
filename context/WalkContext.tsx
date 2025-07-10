import React, { createContext, useContext, ReactNode } from "react";
import { MeetupWalk, Walk, WithId } from "walk2gether-shared";

interface WalkContextType {
  walk: WithId<Walk | MeetupWalk> | null;
}

const WalkContext = createContext<WalkContextType>({
  walk: null,
});

interface WalkProviderProps {
  children: ReactNode;
  walk: WithId<Walk | MeetupWalk> | null;
}

export const WalkProvider = ({
  children,
  walk,
}: WalkProviderProps) => {
  return (
    <WalkContext.Provider
      value={{
        walk,
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
