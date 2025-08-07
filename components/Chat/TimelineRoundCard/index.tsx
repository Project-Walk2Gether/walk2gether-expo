import { useWalk } from "@/context/WalkContext";
import React, { useMemo } from "react";
import { Round, WithId } from "walk2gether-shared";

import ActiveRoundCard from "./ActiveRoundCard";
import CompletedRoundCard from "./CompletedRoundCard";
import UpcomingRoundCard from "./UpcomingRoundCard";

interface Props {
  round: Round | WithId<Round>;
  currentUserId?: string;
  isUpcoming?: boolean;
  isFirstUpcoming?: boolean;
}

export default function TimelineRoundCard({
  round,
  currentUserId,
  isUpcoming = false,
  isFirstUpcoming = false,
}: Props) {
  // Get walk context to access participant data
  const { walk, activeRound } = useWalk();
  const isActive = activeRound && activeRound?.id === round.id;
  const hasEnded = round.endTime.toDate() < new Date();

  // Find the current user's pair
  const userPair = useMemo(() => {
    if (!currentUserId) return null;
    return round.pairs?.find((pair) => pair.userUids.includes(currentUserId));
  }, [round.pairs, currentUserId]);

  // Get partner names (excluding current user)
  const partnerNames = useMemo(() => {
    if (!userPair || !walk?.participantsById) return [];

    // Filter out current user and map to participant names from walk context
    return userPair.userUids
      .filter((uid) => uid !== currentUserId)
      .map((uid) => walk.participantsById[uid]?.displayName);
  }, [userPair, currentUserId, walk?.participantsById]);

  // Show active round
  if (isActive && userPair && !hasEnded) {
    return (
      <ActiveRoundCard
        round={round}
        currentUserId={currentUserId}
        userPair={userPair}
        partnerNames={partnerNames}
      />
    );
  }

  // Show upcoming round card
  if (isUpcoming) {
    return (
      <UpcomingRoundCard round={round} isFirstUpcoming={isFirstUpcoming} />
    );
  }

  // Show completed round card
  if (userPair) {
    return (
      <CompletedRoundCard
        round={round}
        userPair={userPair}
        partnerNames={partnerNames}
      />
    );
  }

  return null;
}
