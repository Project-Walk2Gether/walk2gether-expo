import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@/utils/firestore";
import { collection, query } from "@react-native-firebase/firestore";

// Assuming a Location type exists or create one
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

export const useSavedLocations = () => {
  const { user } = useAuth();

  // Create a reference to user locations collection
  const userLocationsCollection = user
    ? query(collection(db, "users", user.uid, "savedLocations"))
    : undefined;

  // Fetch user's saved locations using the custom useQuery hook as per project rules
  const { docs: savedLocations, loading: loadingSavedLocations } =
    useQuery<Location>(userLocationsCollection);

  return {
    savedLocations,
    loadingSavedLocations,
  };
};

export default useSavedLocations;
