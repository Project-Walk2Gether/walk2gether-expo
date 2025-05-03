import { doc, getDoc } from "@react-native-firebase/firestore";
import { Participant } from "walk2gether-shared";
import { firestore_instance } from "../config/firebase";

/**
 * Get a Google Maps URL for directions to the walk location
 * This utility function remains in the client for the "Open in Google Maps" button
 * Route calculation has been moved to Firebase Functions
 *
 * @param walkId - ID of the walk
 * @param participantId - ID of the participant
 * @returns Google Maps URL string
 */
export async function getDirectionsUrl(
  walkId: string,
  participantId: string
): Promise<string | null> {
  try {
    const participantRef = doc(
      firestore_instance,
      `walks/${walkId}/participants/${participantId}`
    );
    const participantDoc = await getDoc(participantRef);

    if (!participantDoc.exists) return null;

    const participant = participantDoc.data() as Participant;

    if (!participant.lastLocation) return null;

    const walkRef = doc(firestore_instance, `walks/${walkId}`);
    const walkDoc = await getDoc(walkRef);

    if (!walkDoc.exists) return null;

    const walkData = walkDoc.data();

    if (
      !walkData?.location ||
      !walkData.startLocation.latitude ||
      !walkData.startLocation.longitude
    )
      return null;

    // Generate Google Maps URL
    const origin = `${participant.lastLocation.latitude},${participant.lastLocation.longitude}`;
    const destination = `${walkData.startLocation.latitude},${walkData.startLocation.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  } catch (error) {
    console.error("Error generating directions URL:", error);
    return null;
  }
}
