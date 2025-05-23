import { firestore_instance } from "@/config/firebase";
import { WalkFormData } from "@/context/WalkFormContext";
import {
  FirebaseFirestoreTypes,
  Timestamp,
  addDoc,
  collection,
  doc,
  setDoc,
} from "@react-native-firebase/firestore";
import { addMinutes } from "date-fns";
import uuid from "react-native-uuid";
import { Participant, UserData, Walk, WithId } from "walk2gether-shared";

interface CreateWalkParams {
  formData: WalkFormData;
  userData: WithId<UserData>;
}

export async function createWalkFromForm({
  formData,
  userData,
}: CreateWalkParams): Promise<void | FirebaseFirestoreTypes.DocumentReference<Walk>> {
  try {
    // Generate a unique invitation code
    const invitationCode = uuid.v4().toString().slice(0, 8);

    if (
      !formData.date ||
      formData.durationMinutes === undefined ||
      !formData.startLocation
    ) {
      console.error(
        "Missing required walk data: date, durationMinutes, or startLocation"
      );
      throw new Error(
        "Missing required walk data: date, durationMinutes, or startLocation"
      );
    }

    const estimatedEndTime = addMinutes(
      formData.date.toDate(),
      formData.durationMinutes
    );
    const estimatedEndTimeWithBuffer = addMinutes(estimatedEndTime, 60);

    // Create base walk payload with common fields for all walk types
    const basePayload = {
      active: false,
      date: formData.date,
      durationMinutes: formData.durationMinutes,
      organizerName: userData?.name || "",
      createdByUid: userData.id,

      // Location data - For friends walk, both start and current are the same initially
      startLocation: formData.startLocation,
      currentLocation: formData.startLocation,

      // Invitation details
      invitationCode: invitationCode,
      participantUids: [...(formData.participantUids || []), userData.id],

      // Timestamp fields
      estimatedEndTime: Timestamp.fromDate(estimatedEndTime),
      estimatedEndTimeWithBuffer: Timestamp.fromDate(
        estimatedEndTimeWithBuffer
      ),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),

      // Required participant tracking fields
      participantsById: {},
      approvedParticipantCount: 0,
      pendingParticipantCount: 0,
      rejectedParticipantCount: 0,
    };

    // Add type-specific fields based on walk type
    let walkPayload;

    if (formData.type === "meetup") {
      walkPayload = {
        ...basePayload,
        type: "meetup" as const,
        topic: formData.topic || "General Discussion", // Default topic
        minimumNumberOfMinutesWithEachPartner:
          formData.minimumNumberOfMinutesWithEachPartner || 5,
        rounds: [],
      };
    } else if (formData.type === "neighborhood") {
      walkPayload = {
        ...basePayload,
        type: "neighborhood" as const,
      };
    } else {
      // Default to friends walk
      walkPayload = {
        ...basePayload,
        type: "friends" as const,
      };
    }

    const walksRef = collection(
      firestore_instance,
      "walks"
    ) as FirebaseFirestoreTypes.CollectionReference<Walk>;

    console.log("PRE ADDING WALK");
    const walkDocRef = await addDoc<Walk>(walksRef, walkPayload);
    console.log("POST ADDING WALK");

    // Add the user as an approved participant
    const walkId = walkDocRef.id;
    const userId = userData.id;
    const participantRef = doc(
      firestore_instance,
      `walks/${walkId}/participants/${userId}`
    );

    // Create the organizer participant
    const organizerParticipant: Participant = {
      userUid: userId,
      displayName: userData?.name || "Anonymous",
      photoURL: userData?.profilePicUrl || null,
      acceptedAt: Timestamp.now(), // Auto-approve the walk creator
      sourceType: "walk-creator", // Set source type to walk
      status: "pending", // Set initial status to pending
      navigationMethod: "walking", // Default navigation method
      route: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log({ organizerParticipant });
    await setDoc(participantRef, organizerParticipant);

    // Create participant documents for invited users
    const participantPromises: Promise<void>[] = [];
    const invitedUserIds = formData.participantUids || [];

    for (const invitedUserId of invitedUserIds) {
      // Skip if this is the organizer (already added above)
      if (invitedUserId === userId) continue;

      const invitedParticipantRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${invitedUserId}`
      );

      const invitedParticipant: Participant = {
        userUid: invitedUserId,
        displayName: "Invited User", // Will be updated when user accepts
        photoURL: null,
        acceptedAt: null, // Not auto-approved
        rejectedAt: null,
        cancelledAt: null,
        status: "pending",
        sourceType: "invited",
        navigationMethod: "walking",
        route: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      participantPromises.push(
        setDoc(invitedParticipantRef, invitedParticipant)
      );
    }

    // Wait for all participant documents to be created
    if (participantPromises.length > 0) {
      await Promise.all(participantPromises);
    }

    console.log(
      `Created walk with ${
        formData.participantUids?.length || 0
      } invited participants`
    );
    return walkDocRef;
  } catch (error) {
    console.error("Error creating walk:", error);
    // TODO: Show error message
  }
}
