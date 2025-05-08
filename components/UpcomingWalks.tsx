import React from "react";
import { YStack } from "tamagui";
import { useWalks } from "../context/WalksContext";
import WalkCard from "./WalkCard";

interface UpcomingWalksProps {
  title?: string;
  maxWalks?: number;
}

export default function UpcomingWalks({ maxWalks = 3 }: UpcomingWalksProps) {
  const { currentWalks } = useWalks();

  if (!currentWalks || currentWalks.length === 0) {
    return null;
  }

  return (
    <YStack gap="$3">
      {currentWalks.slice(0, maxWalks).map((walk) => (
        <WalkCard key={walk.id} walk={walk} isUpcoming={true} />
      ))}
    </YStack>
  );
}
