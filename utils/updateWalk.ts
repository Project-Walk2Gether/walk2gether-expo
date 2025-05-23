import { firestore_instance } from "@/config/firebase";
import { WalkFormData } from "@/context/WalkFormContext";
import { doc, updateDoc } from "@react-native-firebase/firestore";
import { UserData, WithId } from "walk2gether-shared";
import { updateParticipants } from "./participantManagement";

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
