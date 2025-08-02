import WalkCard from "@/components/WalkCard";
import { useRouter } from "expo-router";
import React from "react";
import {
  Message as MessageType,
  Round as RoundType,
  Walk,
  WithId,
} from "walk2gether-shared";
import MessageComponent from "./Message";
import TimelineRoundCard from "./TimelineRoundCard";

export type TimelineItemType =
  | { type: "message"; data: MessageType }
  | { type: "walk"; data: WithId<Walk> }
  | { type: "round"; data: RoundType }
  | { type: "upcoming-round"; data: RoundType & { isFirstUpcoming?: boolean } };

interface TimelineItemProps {
  item: TimelineItemType;
  currentUserId: string;
  onLongPress?: (message: MessageType) => void;
}

export function TimelineItem({
  item,
  currentUserId,
  onLongPress,
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
        onPress={() =>
          router.push({
            pathname: `/walks/[id]/meet`,
            params: { id: item.data.id },
          })
        }
      />
    );
  } else if (item.type === "round") {
    const round = item.data as RoundType;

    return <TimelineRoundCard round={round} currentUserId={currentUserId} />;
  } else if (item.type === "upcoming-round") {
    const upcomingRound = item.data;

    return (
      <TimelineRoundCard
        round={upcomingRound}
        currentUserId={currentUserId}
        isUpcoming={true}
        isFirstUpcoming={upcomingRound.isFirstUpcoming}
      />
    );
  }

  return null;
}
