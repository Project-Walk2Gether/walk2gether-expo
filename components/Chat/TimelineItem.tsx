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
import Round from "./RoundCard";

export type TimelineItemType =
  | { type: "message"; data: MessageType }
  | { type: "walk"; data: WithId<Walk> }
  | { type: "round"; data: RoundType };

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
            pathname: `/walks/[id]/details`,
            params: { id: item.data.id },
          })
        }
      />
    );
  } else if (item.type === "round") {
    const round = item.data as RoundType;

    return <Round round={round} currentUserId={currentUserId} />;
  }

  return null;
}
