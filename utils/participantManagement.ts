import { firestore_instance } from "@/config/firebase";
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Participant, UserData, WithId } from "walk2gether-shared";

/**
 * Updates the participants collection for a walk
 * - Adds new participants for newly invited users
 * - Sets cancelledAt for removed participants
 */
export async function updateParticipants(
  walkId: string,
  participantUids: string[],
  userData: WithId<UserData>,
  sourceType: "invited" | "requested" | "walk-creator" = "invited"
): Promise<void> {
  try {
    // Fetch current participants
    const participantsRef = collection(
      firestore_instance,
      `walks/${walkId}/participants`
    );
    const participantsSnapshot = await getDocs(participantsRef);

    // Create a map of existing participants by user ID
    const existingParticipants = new Map<
      string,
      {
        id: string;
        cancelledAt: any | null;
      }
    >();

    participantsSnapshot.forEach((doc) => {
      const data = doc.data();
      existingParticipants.set(data.userUid, {
        id: doc.id,
        cancelledAt: data.cancelledAt,
      });
    });

    // Create a set of participant UIDs for easier checking
    const participantUidSet = new Set([...participantUids, userData.id]); // Include the organizer

    // Handle removed participants (set cancelledAt)
    const removedPromises: Promise<void>[] = [];
    existingParticipants.forEach((participant, userUid) => {
      if (!participantUidSet.has(userUid) && !participant.cancelledAt) {
        const participantRef = doc(
          firestore_instance,
          `walks/${walkId}/participants/${userUid}`
        );
        removedPromises.push(
          updateDoc(participantRef, {
            cancelledAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          })
        );
      }
    });

    // Handle newly added participants
    const newParticipantPromises: Promise<void>[] = [];
    for (const userId of participantUids) {
      // Skip if the user is already a participant and not cancelled
      if (
        existingParticipants.has(userId) &&
        !existingParticipants.get(userId)?.cancelledAt
      ) {
        continue;
      }

      // Create new participant document
      const participantRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${userId}`
      );

      // If the participant was previously cancelled, reactivate them
      if (existingParticipants.has(userId)) {
        newParticipantPromises.push(
          updateDoc(participantRef, {
            cancelledAt: null,
            updatedAt: Timestamp.now(),
          })
        );
      } else {
        // Create new participant
        const participant: Omit<Participant, "id"> = {
          userUid: userId,
          displayName: "Invited User", // This will be updated when user accepts
          photoURL: null,
          status: "pending",
          acceptedAt: null,
          rejectedAt: null,
          cancelledAt: null,
          sourceType: userId === userData.id ? "walk-creator" : sourceType,
          navigationMethod: "walking",
          route: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        newParticipantPromises.push(setDoc(participantRef, participant));
      }
    }

    // Wait for all operations to complete
    await Promise.all([...removedPromises, ...newParticipantPromises]);

    // Get the final list of active participants (not cancelled)
    // This includes newly added users and excludes recently cancelled ones
    const activeParticipantIds: string[] = [];

    // Add the walk creator/organizer
    activeParticipantIds.push(userData.id);

    // Add all participants who are not cancelled
    for (const userId of participantUids) {
      if (userId !== userData.id) {
        // Don't add organizer twice
        activeParticipantIds.push(userId);
      }
    }

    // Update the walk document with the participantUids field
    const walkRef = doc(firestore_instance, `walks/${walkId}`);
    await updateDoc(walkRef, {
      participantUids: activeParticipantIds,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating participants:", error);
    throw error;
  }
}

/**
 * Updates the participantUids array in a walk document
 * This is used for querying walks that should be visible to a user
 */
export async function updateWalkVisibility(
  walkId: string,
  userIds: string[]
): Promise<void> {
  try {
    const walkRef = doc(firestore_instance, `walks/${walkId}`);
    await updateDoc(walkRef, {
      participantUids: userIds,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating walk visibility:", error);
    throw error;
  }
}
