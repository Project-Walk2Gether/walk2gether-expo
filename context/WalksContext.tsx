import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  FirebaseFirestoreTypes,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";
import { addHours } from "date-fns";
import "firebase/compat/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { Walk, WithId } from "walk2gether-shared";
import { firestore_instance } from "../config/firebase";
import { useQuery } from "../utils/firestore";
import { useAuth } from "./AuthContext";

interface WalksContextType {
  upcomingWalks: Walk[];
  walksLoading: boolean; // Loading state for fetching walks
  submitting: boolean; // Loading state for mutations (create, RSVP, etc)
  userRSVPs: string[]; // Array of walk IDs the user has RSVPed to
  currentWalk: Walk | null;
  createWalk: (
    walk: Walk
  ) => Promise<FirebaseFirestoreTypes.DocumentReference<Walk>>;
  checkIn: (walkId: string) => Promise<void>;
  getWalkById: (walkId: string) => Walk | undefined;
  rsvpForWalk: (walkId: string) => Promise<void>;
  cancelRSVP: (walkId: string) => Promise<void>;
  hasUserRSVPed: (walkId: string) => boolean;
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
  const [submitting, setSubmitting] = useState(false);
  const { user, isAdmin } = useAuth();

  console.log("Walks provider re-rendering");

  // Get the start of today for filtering upcoming walks
  const now = new Date();
  const oneHourAgo = addHours(now, -1);

  // Create query for upcoming walks
  const upcomingWalksQuery = useMemo(() => {
    if (!user) return undefined;

    return query(
      collection(firestore_instance, "walks"),
      where("active", "==", false),
      where("date", ">", oneHourAgo),
      orderBy("date", "asc"),
      limit(10)
    );
  }, [user, oneHourAgo]);

  // Create query for user RSVPs
  const userRSVPsQuery = useMemo(() => {
    if (!user) return undefined;

    return query(
      collectionGroup(firestore_instance, "rsvps"),
      where("userId", "==", user.uid)
    );
  }, [user]);

  // Use the useQuery hook to fetch walks
  const { docs: upcomingWalks, status: walksStatus } =
    useQuery<WithId<Walk>>(upcomingWalksQuery);

  // Use the useQuery hook to fetch RSVPs
  const { docs: rsvpDocs, status: rsvpsStatus } = useQuery(userRSVPsQuery);

  // Extract walkIds from RSVP docs
  const userRSVPs = useMemo(() => {
    return rsvpDocs.map((rsvp) => rsvp.walkId).filter(Boolean) as string[];
  }, [rsvpDocs]);

  // Loading state for fetching data
  const walksLoading = walksStatus === "loading" || rsvpsStatus === "loading";

  // Current active walk
  const currentWalk = useMemo(
    () => upcomingWalks.find((walk) => walk.active) || null,
    [upcomingWalks]
  );

  // We've replaced this useEffect with useQuery hooks above

  const createWalk = async (walkData: Walk) => {
    if (!user && !isAdmin) {
      throw new Error("You must be an admin to create a walk");
    }

    try {
      const walksRef = collection(firestore_instance, "walks");

      // Create the walk document
      const newWalk: Walk = {
        ...walkData,
        active: false,
        rsvpdUserIds: [],
        createdByUid: user!.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const walkRef = await addDoc(walksRef, newWalk);
      console.log("Walk created successfully:", walkRef.id);
      return walkRef.id; // Return the ID
    } catch (error) {
      console.error("Error creating walk:", error);
      throw error;
    }
  };

  const checkIn = async (walkId: string) => {
    if (!user) {
      throw new Error("User must be logged in to check in");
    }

    try {
      const walkRef = doc(firestore_instance, "walks", walkId);
      const walkDoc = await getDoc(walkRef);

      if (!walkDoc.exists) {
        throw new Error("Walk not found");
      }

      const walkData = walkDoc.data();

      // Add user to the checkedInUsers array if not already present
      const checkedInUsers = walkData?.checkedInUsers || [];

      if (!checkedInUsers.includes(user.uid)) {
        await updateDoc(walkRef, {
          checkedInUsers: arrayUnion(user.uid),
        });
      }

      console.log("User checked in successfully:", user.uid);
    } catch (error) {
      console.error("Error checking in to walk:", error);
      throw error;
    }
  };

  const rsvpForWalk = async (walkId: string) => {
    if (!user) {
      throw new Error("User must be logged in to RSVP");
    }

    setSubmitting(true);
    try {
      const walkRef = doc(firestore_instance, "walks", walkId);

      // Add user to the rsvpUsers array
      await updateDoc(walkRef, {
        rsvpUsers: arrayUnion(user.uid),
      });

      // Create an RSVP document
      const rsvpsRef = collection(walkRef, "rsvps");
      await addDoc(rsvpsRef, {
        userId: user.uid,
        walkId: walkId,
        timestamp: serverTimestamp(),
      });

      console.log("User RSVPed successfully:", user.uid);
    } catch (error) {
      console.error("Error RSVPing for walk:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRSVP = async (walkId: string) => {
    if (!user) {
      throw new Error("User must be logged in to cancel RSVP");
    }

    setSubmitting(true);
    try {
      const walkRef = doc(firestore_instance, "walks", walkId);

      // Remove user from the rsvpUsers array
      await updateDoc(walkRef, {
        rsvpUsers: arrayRemove(user.uid),
      });

      // Find and delete the RSVP document
      const rsvpsRef = collection(walkRef, "rsvps");
      const rsvpsQuery = query(rsvpsRef, where("userId", "==", user.uid));
      const rsvpsSnapshot = await getDocs(rsvpsQuery);

      // Delete each matching RSVP document
      const deletePromises = rsvpsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      console.log("User canceled RSVP successfully:", user.uid);
    } catch (error) {
      console.error("Error canceling RSVP:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const hasUserRSVPed = (walkId: string) => {
    return userRSVPs.includes(walkId);
  };

  // Add getWalkById function to find a walk by its ID
  const getWalkById = (walkId: string): Walk | undefined => {
    return upcomingWalks.find((walk) => walk.id === walkId);
  };

  return (
    <WalksContext.Provider
      value={{
        upcomingWalks,
        walksLoading,
        submitting,
        userRSVPs,
        createWalk,
        checkIn,
        rsvpForWalk,
        cancelRSVP,
        currentWalk,
        hasUserRSVPed,
        getWalkById,
      }}
    >
      {children}
    </WalksContext.Provider>
  );
};
