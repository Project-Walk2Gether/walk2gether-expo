import { db } from "@/config/firebase";
import { collection, getDocs } from "@react-native-firebase/firestore";

/**
 * Finds nearby walkers within a given radius and returns their IDs.
 * @param user The current user object (with uid)
 * @param userLocation The location to search from ({ latitude, longitude })
 * @param radiusKm The search radius in kilometers
 * @param getDistanceInKm Function to calculate distance between two points (lat/lng)
 * @param setNearbyWalkers Callback to set the number of nearby walkers
 * @param setIsLoadingNearbyUsers Callback to set loading state
 * @returns Array of user IDs who are within the specified radius
 */
export async function findNearbyWalkers({
  user,
  userLocation,
  radiusKm,
  getDistanceInKm,
  setNearbyWalkers,
  setIsLoadingNearbyUsers,
}: {
  user: { uid: string } | null;
  userLocation: { latitude: number; longitude: number };
  radiusKm: number;
  getDistanceInKm: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => number;
  setNearbyWalkers: (n: number) => void;
  setIsLoadingNearbyUsers: (b: boolean) => void;
}): Promise<string[]> {
  if (!userLocation) {
    setIsLoadingNearbyUsers(false);
    return [];
  }

  setIsLoadingNearbyUsers(true);
  try {
    // Query users from Firestore who have location data
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    if (usersSnapshot.empty) {
      console.log("No users found");
      setNearbyWalkers(0);
      setIsLoadingNearbyUsers(false);
      return [];
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

    setNearbyWalkers(nearbyUsersCount);
    console.log(`Found ${nearbyUsersCount} users within ${radiusKm}km`);
    return nearbyUserIds;
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return [];
  } finally {
    setIsLoadingNearbyUsers(false);
  }
}
