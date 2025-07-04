import WalkCard from "@/components/WalkCard";
import { handleWalkPress } from "@/utils/navigationUtils";
import { useRouter } from "expo-router";
import React from "react";
import { Message as MessageType, Walk, WithId } from "walk2gether-shared";
import MessageComponent from "./Message";

export type TimelineItemType =
  | { type: "message"; data: MessageType }
  | { type: "walk"; data: WithId<Walk> };

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
        onPress={() => handleWalkPress(item.data as WithId<Walk>, router)}
      />
    );
  }

  return null;
}
