import RespondToInvitation from "@/components/RespondToInvitation";
import { MoreVertical } from "@tamagui/lucide-icons";
import React from "react";
import { Button } from "tamagui";
import {
  Participant,
  Walk,
  walkIsMeetupWalk,
  WithId,
} from "walk2gether-shared";
import WalkDetailsCard from "../WalkDetailsCard";

interface Props {
  walk: WithId<Walk>;
  participantDoc?: WithId<Participant>;
  hasResponded: boolean;
  loading: boolean;
  onMenuPress?: () => void;
}

/**
 * Card component that displays walk invitation response UI
 */
export default function RespondToInvitationCard({
  walk,
  participantDoc,
  hasResponded,
  loading,
  onMenuPress,
}: Props) {
  return (
    <WalkDetailsCard
      title={walkIsMeetupWalk(walk) ? "Respond to request" : "RSVP to join"}
      headerAction={
        hasResponded ? (
          <Button
            size="$2"
            chromeless
            icon={<MoreVertical size={18} />}
            circular
            onPress={onMenuPress}
            disabled={loading}
          />
        ) : undefined
      }
    >
      <RespondToInvitation walk={walk} participantDoc={participantDoc} />
    </WalkDetailsCard>
  );
}
