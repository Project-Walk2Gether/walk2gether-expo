import { firestore_instance } from "@/config/firebase";
import { WalkFormData } from "@/context/WalkFormContext";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Participant, UserData, WithId } from "walk2gether-shared";

interface UpdateWalkParams {
  walkId: string;
  formData: WalkFormData;
  userData: WithId<UserData>;
}

export async function updateExistingWalk({
  walkId,
  formData,
  userData,
}: UpdateWalkParams): Promise<boolean> {
  try {
    if (!walkId) {
      console.error("No walk ID provided for update");
      return false;
    }

    // Create update payload with fields that might have changed
    const updatePayload: Record<string, any> = {
      durationMinutes: formData.durationMinutes,
      visibleToUserIds: [...(formData.visibleToUserIds || []), userData.id],
    };

    // Only include startLocation if it exists in formData
    if (formData.startLocation) {
      updatePayload.startLocation = formData.startLocation;
      updatePayload.currentLocation = formData.startLocation;
    }

    // Only include date if it exists in formData
    if (formData.date) {
      updatePayload.date = formData.date;
    }

    const walkRef = doc(firestore_instance, `walks/${walkId}`);
    await updateDoc(walkRef, updatePayload);

    // Handle participant management
    await updateParticipants(walkId, formData.invitedUserIds || [], userData);

    console.log(`Walk ${walkId} updated successfully`);
    return true;
  } catch (error) {
    console.error("Error updating walk:", error);
    return false;
  }
}

/**
 * Updates the participants collection for a walk
 * - Adds new participants for newly invited users
 * - Sets cancelledAt for removed participants
 */
async function updateParticipants(
  walkId: string,
  invitedUserIds: string[],
  userData: WithId<UserData>
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

    // Create a set of invited user IDs for easier checking
    const invitedUserIdSet = new Set([...invitedUserIds, userData.id]); // Include the organizer

    // Handle removed participants (set cancelledAt)
    const removedPromises: Promise<void>[] = [];
    existingParticipants.forEach((participant, userUid) => {
      if (!invitedUserIdSet.has(userUid) && !participant.cancelledAt) {
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
    for (const userId of invitedUserIds) {
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
  } catch (error) {
    console.error("Error updating participants:", error);
    throw error;
  }
}
