import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { documentWithIdFromSnapshot, useQuery } from "@/utils/firestore";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";
import { startOfDay } from "date-fns";
import { useMemo } from "react";
import { Walk } from "walk2gether-shared";

export function useUpcomingWalks() {
  const { user } = useAuth();
  const midnightToday = startOfDay(new Date());

  const currentWalksQuery = useMemo(() => {
    if (!user) return undefined;

    return query(
      collection(db, "walks"),
      where("date", ">", midnightToday),
      orderBy("date", "asc"),
      limit(10)
    );
  }, [user, midnightToday]);
  // Use the useQuery hook to fetch walks
  const { docs: currentWalks } = useQuery<Walk>(currentWalksQuery);

  return currentWalks;
}

export const createWalk = async (
  user: FirebaseAuthTypes.User,
  walkData: Walk
) => {
  if (!user) {
    throw new Error("You must be logged in to create a walk");
  }

  try {
    const walksRef = collection(db, "walks");

    // Create the walk document
    const newWalk: Walk = {
      ...walkData,
      createdByUid: user!.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const walkRef = await addDoc(walksRef, newWalk);
    console.log("Walk created successfully:", walkRef.id);
    const walk = await getDoc(walkRef);
    return documentWithIdFromSnapshot(walk);
  } catch (error) {
    // Prepare the error context for better debugging
    const errorContext = {
      action: "createWalk",
      userId: user?.uid || "unknown",
    };

    // Format error for throwing - make sure it's an Error object
    const formattedError =
      error instanceof Error
        ? error
        : new Error(`Error creating walk: ${error}`);

    // Log to console, but Crashlytics will capture via higher level handler
    console.error("Error creating walk:", error);

    // Re-throw with context - will be caught by component using this service
    // The error will have additional context when caught and reported
    formattedError.name = "WalkServiceError";
    throw formattedError;
  }
};

export const checkIn = async (user: FirebaseAuthTypes.User, walkId: string) => {
  if (!user) {
    throw new Error("User must be logged in to check in");
  }

  try {
    const walkRef = doc(db, "walks", walkId);
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
