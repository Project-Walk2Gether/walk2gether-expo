import { firestore_instance } from "@/config/firebase";
import { useQuery } from "@/utils/firestore";
import {
  collection,
  FirebaseFirestoreTypes,
  limit,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";
import "firebase/compat/firestore";
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { Walk, WithId } from "walk2gether-shared";
import { useAuth } from "./AuthContext";

interface WalksContextType {
  upcomingWalks: WithId<Walk>[];
  activeWalks: WithId<Walk>[];
  walksLoading: boolean;
  createWalk: (
    walk: Walk
  ) => Promise<FirebaseFirestoreTypes.DocumentReference<Walk>>;
  getWalkById: (walkId: string) => Walk | undefined;
}

const WalksContext = createContext<WalksContextType | undefined>(undefined);

export const useWalks = () => {
  const context = useContext(WalksContext);
  if (context === undefined) {
    throw new Error("useWalks must be used within a WalksProvider");
  }
  return context;
};

interface WalksProviderProps {
  children: ReactNode;
}

export const WalksProvider: React.FC<WalksProviderProps> = ({ children }) => {
  const { user } = useAuth();

  // Get current time for filtering active walks
  const now = new Date();

  // Create query for current and upcoming walks based on estimatedEndTime
  const currentWalksQuery = useMemo(() => {
    if (!user) return undefined;

    // Get walks that haven't ended yet (estimatedEndTime > now)
    return query(
      collection(firestore_instance, "walks"),
      where("estimatedEndTime", ">", now),
      where("participantUids", "array-contains", user.uid),
      orderBy("estimatedEndTime", "asc"),
      limit(10)
    );
  }, [user, now]);

  // Use the useQuery hook to fetch walks
  const { docs: currentWalks, status: walksStatus } =
    useQuery<WithId<Walk>>(currentWalksQuery);

  // Loading state for fetching data
  const walksLoading = walksStatus === "loading";

  // Split walks into active and upcoming
  const { activeWalks, upcomingWalks } = useMemo(() => {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    return currentWalks.reduce(
      (acc, walk) => {
        // If walk date is less than 30 minutes from now, it's active
        if (walk.date && walk.date.toDate() <= thirtyMinutesFromNow) {
          acc.activeWalks.push(walk);
        } else {
          acc.upcomingWalks.push(walk);
        }
        return acc;
      },
      { activeWalks: [] as WithId<Walk>[], upcomingWalks: [] as WithId<Walk>[] }
    );
  }, [currentWalks]);

  // Add getWalkById function to find a walk by its ID
  const getWalkById = (walkId: string): Walk | undefined => {
    return currentWalks.find((walk) => walk.id === walkId);
  };

  return (
    <WalksContext.Provider
      value={{
        upcomingWalks,
        activeWalks,
        walksLoading,
        getWalkById,
      }}
    >
      {children}
    </WalksContext.Provider>
  );
};
