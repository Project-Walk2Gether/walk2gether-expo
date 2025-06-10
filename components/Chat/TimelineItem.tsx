import WalkCard from "@/components/WalkCard";
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
        walk={item.data as WithId<Walk>}
        showActions={false}
        onPress={undefined}
      />
    );
  }

  return null;
}
