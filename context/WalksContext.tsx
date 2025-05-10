import { firestore_instance } from "@/config/firebase";
import { useQuery } from "@/utils/firestore";
import {
  addDoc,
  collection,
  FirebaseFirestoreTypes,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "@react-native-firebase/firestore";
import { addHours } from "date-fns";
import "firebase/compat/firestore";
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { Walk, WithId } from "walk2gether-shared";
import { useAuth } from "./AuthContext";

interface WalksContextType {
  upcomingWalks: WithId<Walk>[];
  activeWalks: WithId<Walk>[];
  walksLoading: boolean; // Loading state for fetching walks
  currentWalk: Walk | null;
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
      where("active", "==", false),
      where("estimatedEndTime", ">", now),
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

  // Current active walk
  const currentWalk = useMemo(
    () => currentWalks.find((walk) => walk.active) || null,
    [currentWalks]
  );

  // We've replaced this useEffect with useQuery hooks above

  const createWalk = async (walkData: Walk) => {
    if (!user) {
      throw new Error("You must be an admin to create a walk");
    }

    try {
      const walksRef = collection(
        firestore_instance,
        "walks"
      ) as FirebaseFirestoreTypes.CollectionReference<Walk>;

      // Create the walk document
      const newWalk: Walk = {
        ...walkData,
        active: false,
        createdByUid: user!.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const walkRef = await addDoc<Walk>(walksRef, newWalk);
      console.log("Walk created successfully:", walkRef.id);
      return walkRef; // Return the ID
    } catch (error) {
      console.error("Error creating walk:", error);
      throw error;
    }
  };

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
        createWalk,
        currentWalk,
        getWalkById,
      }}
    >
      {children}
    </WalksContext.Provider>
  );
};
