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
import { Walk, WithId } from "walk2gether-shared";
import { DocumentReferenceLike } from "walk2gether-shared/lib/firestore/documentReference";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "../utils/firestore";

export function useUpcomingWalks() {
  const { user } = useAuth();
  const midnightToday = startOfDay(new Date());

  const currentWalksQuery = useMemo(() => {
    if (!user) return undefined;

    return query(
      collection(db, "walks"),
      where("active", "==", false),
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
      active: false,
      rsvpdUserIds: [],
      createdByUid: user!.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const walkRef = await addDoc(walksRef, newWalk);
    console.log("Walk created successfully:", walkRef.id);
    const walk = await getDoc(walkRef);
    return {
      id: walk.id,
      ...walk.data(),
      _ref: walkRef as DocumentReferenceLike<Walk>,
    } as WithId<Walk>;
  } catch (error) {
    console.error("Error creating walk:", error);
    throw error;
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
