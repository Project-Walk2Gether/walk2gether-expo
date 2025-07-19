import RespondToInvitation from "@/components/RespondToInvitation";
import React from "react";
import { Button } from "tamagui";
import { WithId, Walk, Participant } from "walk2gether-shared";
import WalkDetailsCard from "../WalkDetailsCard";
import { MoreVertical } from "@tamagui/lucide-icons";

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
      title="Respond to request"
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
      <RespondToInvitation
        walk={walk}
        participantDoc={participantDoc}
      />
    </WalkDetailsCard>
  );
}
