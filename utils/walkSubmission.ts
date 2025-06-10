import { firestore_instance } from "@/config/firebase";
import { WalkFormData } from "@/context/WalkFormContext";
import {
  FirebaseFirestoreTypes,
  Timestamp,
  addDoc,
  collection,
  doc,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";
import { addMinutes } from "date-fns";
import uuid from "react-native-uuid";
import { Participant, UserData, Walk, WithId } from "walk2gether-shared";
import { fetchDocsByIds } from "@/utils/firestore";

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

    // Initialize the participantsById object for the walk document
    const participantsById: Record<string, Participant> = {};

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

    // Add organizer to participantsById
    participantsById[userId] = organizerParticipant;

    await setDoc(participantRef, organizerParticipant);

    // Create participant documents for invited users
    const participantPromises: Promise<void>[] = [];
    const invitedUserIds = formData.participantUids || [];
    
    // Filter out the organizer from invitedUserIds
    const filteredInvitedUserIds = invitedUserIds.filter(id => id !== userId);
    
    // Fetch user data for all invited participants
    let userDataMap: Record<string, WithId<UserData>> = {};
    
    if (filteredInvitedUserIds.length > 0) {
      try {
        const userDocs = await fetchDocsByIds<UserData>("users", filteredInvitedUserIds);
        
        // Create a map of user IDs to user data
        userDataMap = userDocs.reduce((acc, userData) => {
          acc[userData.id] = userData;
          return acc;
        }, {} as Record<string, WithId<UserData>>);
      } catch (error) {
        console.error("Error fetching user data for invited participants:", error);
      }
    }

    for (const invitedUserId of filteredInvitedUserIds) {
      // Get user data if available
      const userData = userDataMap[invitedUserId];
      
      const invitedParticipantRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${invitedUserId}`
      );

      const invitedParticipant: Participant = {
        userUid: invitedUserId,
        displayName: userData?.name || "Invited User", // Use actual name from user data if available
        photoURL: userData?.profilePicUrl || null,
        acceptedAt: null, // Not auto-approved
        deniedAt: null,
        cancelledAt: null,
        status: "pending",
        sourceType: "invited",
        navigationMethod: "walking",
        route: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add participant to participantsById map
      participantsById[invitedUserId] = invitedParticipant;
      
      participantPromises.push(
        setDoc(invitedParticipantRef, invitedParticipant)
      );
    }

    // Wait for all participant documents to be created
    if (participantPromises.length > 0) {
      await Promise.all(participantPromises);
    }
    
    // Update the walk document with participantsById data
    // We need to properly cast the data for Firebase
    const walkDataUpdate = {
      participantsById: participantsById as FirebaseFirestoreTypes.DocumentData
    };
    await updateDoc(walkDocRef, walkDataUpdate);

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
