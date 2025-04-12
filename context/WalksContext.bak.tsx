import { db } from "@/config/firebase";
import {
  createWalk as createWalkService,
  useMyPastWalks,
  useMyRSVPs,
  useUpcomingWalks,
} from "@/services/walksService";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";
import { createContext, ReactNode, useContext, useState } from "react";
import { RSVP, Walk, WithId } from "walk2gether-shared";
import { useAuth } from "./AuthContext";

interface WalksContextType {
  upcomingWalks: WithId<Walk>[];
  myRsvps: WithId<RSVP>[];
  myPastWalks: WithId<Walk>[];
  createWalk: (walkData: Walk) => Promise<WithId<Walk>>;
  isSubmitting: boolean;
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
  const upcomingWalks = useUpcomingWalks();
  const myRsvps = useMyRSVPs();
  const myPastWalks = useMyPastWalks();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasUserRSVPed = (walkId: string) =>
    myRsvps.some((rsvp) => rsvp.walkId === walkId);

  const createWalk = async (walkData: Walk) => {
    setIsSubmitting(true);
    try {
      return await createWalkService(user!, walkData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rsvpForWalk = async (walkId: string) => {
    if (!user) {
      throw new Error("User must be logged in to RSVP");
    }

    setIsSubmitting(true);
    try {
      const walkRef = doc(db, "walks", walkId);

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
      setIsSubmitting(false);
    }
  };

  const cancelRSVP = async (walkId: string) => {
    if (!user) {
      throw new Error("User must be logged in to cancel RSVP");
    }

    setIsSubmitting(true);
    try {
      const walkRef = doc(db, "walks", walkId);

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
      setIsSubmitting(false);
    }
  };

  return (
    <WalksContext.Provider
      value={{
        upcomingWalks,
        myRsvps,
        myPastWalks,
        createWalk,
        isSubmitting,
        hasUserRSVPed,
      }}
    >
      {children}
    </WalksContext.Provider>
  );
};
