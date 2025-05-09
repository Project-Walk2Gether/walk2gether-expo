import { db, firestore_instance } from "@/config/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "@react-native-firebase/firestore";
import * as Location from "expo-location";
import { Location as LocationType } from "walk2gether-shared";
import { writeLogIfEnabled } from "./logging";

/**
 * Interface representing a participant's last location
 * Based on the Location type from walk2gether-shared but simplified for lastLocation field
 */
interface LastLocation {
  latitude: number;
  longitude: number;
  timestamp: Timestamp | Date;
}

/**
 * Service to handle location updates for both foreground and background tracking
 */
export const locationService = {
  /**
   * Updates a participant's location in Firestore
   * - Creates a document in the locations subcollection
   * - Updates the lastLocation field on the participant
   * 
   * @param walkId The ID of the walk
   * @param userId The ID of the user
   * @param location The location object from expo-location
   * @returns Promise that resolves when the location is updated
   */
  async updateLocation(
    walkId: string,
    userId: string,
    location: Location.LocationObject
  ): Promise<void> {
    if (!userId || !walkId) return;

    try {
      // Create timestamp for this update
      const timestamp = Timestamp.now();

      // 1. Update the locations subcollection (location history)
      const locationsCollectionRef = collection(
        firestore_instance,
        `walks/${walkId}/participants/${userId}/locations`
      );

      // Prepare location data according to schema from walk2gether-shared
      const locationData: Partial<LocationType> & {
        timestamp: Timestamp;
        walkId: string;
        participantId: string;
      } = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        createdAt: timestamp,
        updatedAt: timestamp,
        timestamp, // Specific timestamp for this ping
        walkId,
        participantId: userId,
      };

      // Write location history to subcollection
      await addDoc(locationsCollectionRef, locationData);

      // 2. Update lastLocation on the participant document
      const participantDocRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${userId}`
      );

      const lastLocation: LastLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp,
      };

      await setDoc(
        participantDocRef,
        {
          lastLocation,
        },
        { merge: true }
      );

      await writeLogIfEnabled({
        message: `Location updated for walkId: ${walkId}, userId: ${userId}`,
      });
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  },
};
