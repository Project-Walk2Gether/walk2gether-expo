import { db } from "@/config/firebase";
import { collection, getDocs } from "@react-native-firebase/firestore";
import { getDistanceInKm } from "walk2gether-shared";

/**
 * Finds nearby walkers within a given radius.
 * @param user The current user object (with uid)
 * @param userLocation The location to search from ({ latitude, longitude })
 * @param radiusKm The search radius in kilometers
 * @returns Object containing nearby user IDs and count of nearby walkers
 */
export async function findNearbyWalkers({
  user,
  userLocation,
  radiusKm,
}: {
  user: { uid: string } | null;
  userLocation: { latitude: number; longitude: number };
  radiusKm: number;
}): Promise<{ nearbyUserIds: string[]; nearbyUsersCount: number }> {
  if (!userLocation) {
    return { nearbyUserIds: [], nearbyUsersCount: 0 };
  }

  try {
    // Query users from Firestore who have location data
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    if (usersSnapshot.empty) {
      console.log("No users found");
      return { nearbyUserIds: [], nearbyUsersCount: 0 };
    }

    // Filter users by distance
    let nearbyUsersCount = 0;
    const nearbyUserIds: string[] = [];
    
    usersSnapshot.forEach((doc) => {
      // Skip the current user
      if (doc.id === user?.uid) return;

      const userData = doc.data();
      const userLoc = userData.location;

      // If user has location data
      if (userLoc && userLoc.latitude && userLoc.longitude) {
        const distance = getDistanceInKm(
          userLocation.latitude,
          userLocation.longitude,
          userLoc.latitude,
          userLoc.longitude
        );

        // Count users within radius
        if (distance <= radiusKm) {
          nearbyUsersCount++;
          nearbyUserIds.push(doc.id);
        }
      }
    });

    console.log(`Found ${nearbyUsersCount} users within ${radiusKm}km`);
    return { nearbyUserIds, nearbyUsersCount };
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return { nearbyUserIds: [], nearbyUsersCount: 0 };
  }
}
