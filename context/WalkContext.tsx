import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { MeetupWalk, Participant, Round, Walk, WithId } from "walk2gether-shared";
import { useActiveRound } from "@/hooks/useActiveRound";
import * as Notifications from 'expo-notifications';

interface WalkContextType {
  walk: WithId<Walk | MeetupWalk> | null;
  participants: WithId<Participant>[] | null;
  goBack: () => void;
  currentUserParticipantDoc: WithId<Participant> | undefined;
  isLoadingParticipants: boolean;
  activeRound: WithId<Round> | undefined;
  userPair: { emoji: string; color: string; userUids: string[] } | undefined;
  syncRoundNotifications: () => Promise<void>;
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
  // Set up notifications permission and configuration
  useEffect(() => {
    async function configureNotifications() {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }
      
      // Configure notification behavior
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
    
    configureNotifications();
  }, []);
  
  // Use the active round hook
  const { 
    activeRound, 
    userPair, 
    syncRoundNotifications 
  } = useActiveRound(
    walk?._ref, 
    walk?.createdByUid
  );
  
  // Sync notifications whenever the active round changes
  useEffect(() => {
    if (activeRound) {
      syncRoundNotifications();
    }
  }, [activeRound?.id]);
  
  return (
    <WalkContext.Provider
      value={{
        walk,
        goBack,
        participants,
        currentUserParticipantDoc,
        isLoadingParticipants,
        activeRound,
        userPair,
        syncRoundNotifications,
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
