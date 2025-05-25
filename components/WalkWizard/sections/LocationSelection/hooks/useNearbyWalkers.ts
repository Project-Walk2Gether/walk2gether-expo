import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { findNearbyWalkers } from '@/utils/userSearch';

interface UseNearbyWalkersProps {
  startLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  walkType?: string;
  radiusInMeters: number;
}

export const useNearbyWalkers = ({ 
  startLocation, 
  walkType, 
  radiusInMeters 
}: UseNearbyWalkersProps) => {
  const { user } = useAuth();
  const [nearbyWalkers, setNearbyWalkers] = useState(0);
  const [isLoadingNearbyUsers, setIsLoadingNearbyUsers] = useState(false);

  // Memoize the function to fetch nearby walkers to avoid recreating it on every render
  const fetchNearbyWalkers = useCallback(async () => {
    // Don't do anything if startLocation is undefined/null or walkType isn't neighborhood
    if (walkType !== "neighborhood" || !startLocation || !user) {
      return;
    }
    
    setIsLoadingNearbyUsers(true);

    try {
      const result = await findNearbyWalkers({
        user,
        userLocation: {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
        },
        radiusKm: radiusInMeters / 1000,
      });

      setNearbyWalkers(result.nearbyUsersCount);
      console.log(`Found ${result.nearbyUsersCount} nearby users`);
    } catch (error) {
      console.error("Error finding nearby walkers:", error);
      setNearbyWalkers(0);
    } finally {
      setIsLoadingNearbyUsers(false);
    }
  }, [
    // Only depend on the values that should trigger a recalculation
    walkType,
    startLocation?.latitude,
    startLocation?.longitude,
    user?.uid, // Only depend on user ID, not the entire user object
    radiusInMeters
  ]);

  // Find nearby walkers when the location is selected and it's a neighborhood walk
  useEffect(() => {
    fetchNearbyWalkers();
  }, [fetchNearbyWalkers]); // fetchNearbyWalkers is memoized, so this will only run when its dependencies change

  return {
    nearbyWalkers,
    isLoadingNearbyUsers,
  };
};

export default useNearbyWalkers;
