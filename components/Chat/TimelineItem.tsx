import WalkCard from "@/components/WalkCard";
import { handleWalkPress } from "@/utils/navigationUtils";
import { useRouter } from "expo-router";
import React from "react";
import { Message as MessageType, Walk, WithId, Round as RoundType } from "walk2gether-shared";
import MessageComponent from "./Message";
import Round from "./Round";

export type TimelineItemType =
  | { type: "message"; data: MessageType }
  | { type: "walk"; data: WithId<Walk> }
  | { type: "round"; data: RoundType };

interface TimelineItemProps {
  item: TimelineItemType;
  currentUserId: string;
  onLongPress?: (message: MessageType) => void;
  activeRound: RoundType | null;
  onToggleActiveRound?: (round: RoundType) => void;
}

export function TimelineItem({
  item,
  currentUserId,
  onLongPress,
  activeRound,
  onToggleActiveRound,
}: TimelineItemProps) {
  const router = useRouter();
  
  if (item.type === "message") {
    return (
      <MessageComponent
        message={item.data}
        currentUserId={currentUserId}
        onLongPress={onLongPress}
      />
    );
  } else if (item.type === "walk") {
    return (
      <WalkCard
        showActions
        walk={item.data as WithId<Walk>}
        onPress={() => handleWalkPress(item.data as WithId<Walk>, router)}
      />
    );
  } else if (item.type === "round") {
    const round = item.data as RoundType;
    const isActive = activeRound?.roundNumber === round.roundNumber;
    
    return (
      <Round
        round={round}
        currentUserId={currentUserId}
        isActive={isActive}
        onToggleActive={() => onToggleActiveRound?.(round)}
      />
    );
  }

  return null;
}
