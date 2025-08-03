import React, { createContext, ReactNode, useContext, useEffect, useMemo } from "react";
import { MeetupWalk, Participant, Round, Walk, WithId } from "walk2gether-shared";
import { useActiveRound } from "@/hooks/useActiveRound";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
import { useAuth } from "@/context/AuthContext";
import { useRoundRotation } from "@/hooks/useRoundRotation";
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
}

export const WalkProvider = ({
  children,
  walk,
  goBack,
}: WalkProviderProps) => {
  const { user } = useAuth();
  
  // Get walk ID from the walk document
  const walkId = useMemo(() => {
    if (!walk?._ref) return "";
    const pathParts = walk._ref.path.split("/");
    return pathParts[pathParts.length - 1];
  }, [walk?._ref]);
  
  // Get participants for the walk
  const participants = useWalkParticipants(walkId);
  const isLoadingParticipants = !participants && !!walkId;

  // Get the current user's participant document
  const currentUserParticipantDoc = useMemo(() => {
    return participants?.find(
      (participant) => participant.userUid === user?.uid
    );
  }, [participants, user?.uid]);
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
  
  // Use the round rotation hook for automatic round management
  useRoundRotation(walk);
  
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
