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
      throw new Error(
        "Missing required walk data: date, durationMinutes, or startLocation"
      );
    }

    const estimatedEndTime = addMinutes(
      formData.date.toDate(),
      formData.durationMinutes
    );
    const estimatedEndTimeWithBuffer = addMinutes(estimatedEndTime, 60);

    // Create complete walk payload with all required fields from the Walk type
    const walkPayload: Partial<Walk> = {
      active: false,
      date: formData.date,
      durationMinutes: formData.durationMinutes,
      organizerName: userData?.name || "",
      createdByUid: userData.id,
      type: formData.type,

      // Location data - For friends walk, both start and current are the same initially
      startLocation: formData.startLocation,
      currentLocation: formData.startLocation,

      // Invitation details
      invitationCode: invitationCode,
      invitedUserIds: [...(formData.invitedUserIds || []), userData.id],
      invitedPhoneNumbers: formData.invitedPhoneNumbers || [],

      estimatedEndTime: Timestamp.fromDate(estimatedEndTime),
      estimatedEndTimeWithBuffer: Timestamp.fromDate(
        estimatedEndTimeWithBuffer
      ),
    };

    const walksRef = collection(
      firestore_instance,
      "walks"
    ) as FirebaseFirestoreTypes.CollectionReference<Walk>;

    const walkDocRef = await addDoc<Walk>(walksRef, walkPayload);

    // Add the user as an approved participant
    const walkId = walkDocRef.id;
    const userId = userData.id;
    const participantRef = doc(
      firestore_instance,
      `walks/${walkId}/participants/${userId}`
    );

    const participant: Participant = {
      userUid: userId,
      displayName: userData?.name || "Anonymous",
      photoURL: userData?.profilePicUrl || null,
      approvedAt: Timestamp.now(), // Auto-approve the walk creator
      status: "pending", // Set initial status to pending
      navigationMethod: "walking", // Default navigation method
      route: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(participantRef, participant);

    return walkDocRef;
  } catch (error) {
    console.error("Error creating walk:", error);
    // TODO: Show error message
  }
}
