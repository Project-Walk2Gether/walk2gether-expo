import { WalkFormData } from "@/context/WalkFormContext";
import {
  FirebaseFirestoreTypes,
  Timestamp,
} from "@react-native-firebase/firestore";
import { Router } from "expo-router";
import uuid from "react-native-uuid";
import { Friendship, UserData, Walk } from "walk2gether-shared";

/**
 * Gets a list of unique user IDs from the user's friendships to share the walk with
 *
 * @param userId The current user's ID
 * @param formData The walk form data
 * @param friendships List of user's friendships
 * @returns Array of unique user IDs from friendships, excluding the current user
 */
const getSharedWithUserUids = (
  userId: string,
  friendships: Friendship[] = []
): string[] => {
  // Extract all user IDs from friendships
  const friendUids = friendships.flatMap((friendship) => friendship.uids);

  // Filter out the current user and create a unique list
  const uniqueFriendUids = [
    ...new Set(friendUids.filter((uid) => uid !== userId)),
  ];

  return uniqueFriendUids;
};

interface CreateWalkParams {
  formData: WalkFormData;
  userData: UserData | null;
  userId: string;
  createWalk: (
    walkData: Walk
  ) => Promise<FirebaseFirestoreTypes.DocumentReference<Walk>>;
  router: Router;
  friendships?: Friendship[];
}

/**
 * Creates a new walk based on form data and handles post-submission actions
 *
 * @param params Object containing all necessary data and functions to create a walk
 * @returns Promise that resolves when the walk is created and post-submission actions are complete
 */
export const createWalkFromForm = async ({
  formData,
  userData,
  userId,
  createWalk,
  router,
  friendships = [],
}: CreateWalkParams): Promise<void> => {
  if (!formData.date || !formData.location || !formData.duration) {
    console.error("Missing required form data");
    return;
  }

  try {
    // Generate a unique invitation code
    const invitationCode = uuid.v4().toString().slice(0, 8);

    // Create location object from form data
    const locationData = {
      name: formData.location.name,
      placeId: "", // Default empty string for placeId
      latitude: formData.location.latitude,
      longitude: formData.location.longitude,
    };

    // Create complete walk payload with all required fields from the Walk type
    const walkPayload = {
      // Basic walk properties
      active: false,
      date: Timestamp.fromDate(formData.date),
      durationMinutes: formData.duration,
      organizerName: userData?.name || "",
      createdByUid: userId,
      type: formData.walkType as any,

      // Location data - For friends walk, both start and current are the same initially
      startLocation: locationData,
      currentLocation: locationData,
      location: locationData, // This is used in UI for display purposes

      // Invitation details
      invitationCode: invitationCode,
      invitedUserIds: formData.invitedUserIds || [],
      invitedPhoneNumbers: formData.invitedPhoneNumbers || [],

      // Sharing
      sharedWithUserUids: getSharedWithUserUids(userId, friendships),

      // Additional required fields for Friends walk
      rounds: [],
    } as unknown as Walk; // Cast to unknown first to resolve type mismatch

    // Create the walk
    await createWalk(walkPayload);

    // If there are phone numbers to invite, send SMS invitations
    const phoneNumbers = formData.invitedPhoneNumbers || [];
    if (phoneNumbers.length > 0) {
      try {
        console.log("Sending SMS invitations to:", phoneNumbers);
        // This would typically call a Cloud Function to send SMS invites
        // We'll implement this functionality on the backend
      } catch (error) {
        console.error("Error sending SMS invitations:", error);
      }
    }

    // Immediately redirect to home screen after creating a walk
    router.back();

    // Show confetti animation after a delay once the screen is closed
    setTimeout(() => {
      // showConfetti(0);
    }, 600);
  } catch (error) {
    console.error("Error creating walk:", error);
    // TODO: Show error message
  }
};
