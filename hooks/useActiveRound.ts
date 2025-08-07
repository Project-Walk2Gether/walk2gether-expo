import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@/utils/firestore";
import { collection, orderBy, query } from "@react-native-firebase/firestore";
import { useMemo } from "react";
import { Round, WithId } from "walk2gether-shared";

/**
 * Hook to fetch and manage the active round for a walk
 * @param walkRef Document reference to the walk
 * @param walkOwnerId The user ID of the walk owner
 * @returns Object containing active round and related data
 */
export function useActiveRound(walkRef: any, walkOwnerId?: string) {
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const isWalkOwner = currentUserId === walkOwnerId;

  // Query for rounds, ordered by startTime descending (newest first)
  const roundsQuery = useMemo(() => {
    if (!walkRef) return undefined;
    return query(collection(walkRef, "rounds"), orderBy("startTime", "desc"));
  }, [walkRef]);

  const { docs: rounds } = useQuery(roundsQuery);
  const activeRound = useMemo(() => {
    return rounds?.[0] as WithId<Round> | undefined;
  }, [rounds]);

  // Find the current user's pair in the active round
  const userPair = useMemo(() => {
    if (!activeRound || !currentUserId) return undefined;
    return activeRound.pairs.find((pair) =>
      pair.userUids.includes(currentUserId)
    );
  }, [activeRound, currentUserId]);

  // Round notifications are now handled server-side via the roundRotationScheduler

  // Return all the useful data and functions
  return {
    rounds,
    activeRound,
    userPair,
  };
}
