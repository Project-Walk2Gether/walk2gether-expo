import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
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
import { startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Pair, RSVP, Walk, WithId } from "walk2gether-shared";
import { DocumentReferenceLike } from "walk2gether-shared/lib/utils/documentReference";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "../utils/firestore";
import { getRandomColor } from "../utils/random";

// Create a new round with rotated pairs
// We'll implement this directly in the client for now
// Later we could move this to a Cloud Function
export const rotatePairs = async (walkId: string) => {
  try {
    // First, get the current walk data
    const walkRef = doc(db, "walks", walkId);
    const walkSnapshot = await getDoc(walkRef);
    const walkData = walkSnapshot.data();

    if (!walkData) {
      throw new Error("Walk not found");
    }

    // If there's a current round, complete it
    if (walkData.currentRoundId) {
      await walkRef.collection("rounds").doc(walkData.currentRoundId).update({
        active: false,
        endTime: Timestamp.now(),
      });
    }

    // Get all checked-in users
    const checkedInUsers = walkData.checkedInUsers || [];

    if (checkedInUsers.length < 2) {
      throw new Error("Not enough users checked in to create pairs");
    }

    // Shuffle the users
    const shuffledUsers = [...checkedInUsers].sort(() => Math.random() - 0.5);

    // Create new pairs
    const pairs: Pair[] = [];

    // Handle odd number of users by creating one triple
    if (shuffledUsers.length % 2 === 1) {
      // Take the last 3 users and make a group of 3
      const tripleUsers = shuffledUsers.splice(shuffledUsers.length - 3, 3);
      pairs.push({
        id: `pair-triple-${Date.now()}`,
        users: tripleUsers,
        color: getRandomColor(),
        number: pairs.length + 1,
        isTriple: true,
      });
    }

    // Create pairs with remaining users
    for (let i = 0; i < shuffledUsers.length; i += 2) {
      pairs.push({
        id: `pair-${i}-${Date.now()}`,
        users: [shuffledUsers[i], shuffledUsers[i + 1]],
        color: getRandomColor(),
        number: pairs.length + 1,
      });
    }

    // Create a new round
    const newRoundRef = walkRef.collection("rounds").doc();
    await newRoundRef.set({
      walkId,
      roundNumber: (walkData.currentRotation || 0) + 1,
      startTime: Timestamp.now(),
      endTime: null,
      pairs,
      active: true,
    });

    // Update the walk with the new round info
    await walkRef.update({
      currentRoundId: newRoundRef.id,
      currentRotation: (walkData.currentRotation || 0) + 1,
      lastRotationTime: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error rotating pairs:", error);
    throw error;
  }
};

export const joinWalk = async (walkId: string) => {};

export function useMyPastWalks() {
  const { user } = useAuth();
  const [allPastWalks, setAllPastWalks] = useState<Walk[]>([]);

  // Calculate timestamp for filtering out active walks with 1-hour buffer
  // Only show truly past walks (more than 1 hour after scheduled time)
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  const cutoffTimestamp = Timestamp.fromDate(oneHourAgo);

  // Query for walks the user has RSVP'd to
  const rsvpWalksQuery = query(
    collection(db, "walks"),
    where("date", "<", cutoffTimestamp),
    where("rsvpUsers", "array-contains", user!.uid)
  );
  const { docs: rsvpWalks } = useQuery<Walk>(rsvpWalksQuery);

  // Query for walks the user has hosted
  const hostedWalksQuery = query(
    collection(db, "walks"),
    where("date", "<", cutoffTimestamp),
    where("createdByUid", "==", user!.uid)
  );
  const { docs: hostedWalks } = useQuery<Walk>(hostedWalksQuery);

  // Merge and deduplicate walks
  useEffect(() => {
    // Combine both arrays
    const combinedWalks = [...rsvpWalks, ...hostedWalks];

    // Deduplicate by walk ID
    const uniqueWalks = combinedWalks.reduce<Walk[]>((unique, walk) => {
      // Check if this walk ID is already in our unique array
      const exists = unique.some((item) => item.id === walk.id);
      if (!exists) {
        unique.push(walk);
      }
      return unique;
    }, []);

    // Sort by date (most recent first)
    uniqueWalks.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date();
      const dateB = b.date?.toDate ? b.date.toDate() : new Date();
      return dateB.getTime() - dateA.getTime();
    });

    setAllPastWalks(uniqueWalks);
  }, [rsvpWalks, hostedWalks]);

  return allPastWalks;
}

export function useMyRSVPs() {
  const { user } = useAuth();
  const userRSVPsQuery = useMemo(() => {
    if (!user) return undefined;

    return query(collectionGroup(db, "rsvps"), where("userId", "==", user.uid));
  }, [user]);

  const { docs: rsvpDocs } = useQuery<RSVP>(userRSVPsQuery);
  return rsvpDocs;
}

export function useUpcomingWalks() {
  const { user } = useAuth();
  const midnightToday = startOfDay(new Date());

  const upcomingWalksQuery = useMemo(() => {
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
  const { docs: upcomingWalks } = useQuery<Walk>(upcomingWalksQuery);

  return upcomingWalks;
}

export const rsvpForWalk = async (
  user: FirebaseAuthTypes.User,
  walkId: string
) => {
  if (!user) {
    throw new Error("User must be logged in to RSVP");
  }

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
  }
};

export const cancelRSVP = async (
  user: FirebaseAuthTypes.User,
  walkId: string
) => {
  if (!user) {
    throw new Error("User must be logged in to cancel RSVP");
  }
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
    const deletePromises = rsvpsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log("User canceled RSVP successfully:", user.uid);
  } catch (error) {
    console.error("Error canceling RSVP:", error);
    throw error;
  }
};

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
