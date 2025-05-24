import { COLORS } from "@/styles/colors";
import { Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { YStack } from "tamagui";
import { Walk, WithId, walkIsFriendsWalk } from "walk2gether-shared";
import { IconTextRow } from "./IconTextRow";
import { WalkCardButton } from "./WalkCardButton";

interface Props {
  walk: WithId<Walk>;
  isMine: boolean;
}

/**
 * Component to display when a walk is waiting for participants to join
 * Shows a message and an invite button for friend walks
 */
export const WaitingForJoinersSection: React.FC<Props> = ({ walk, isMine }) => {
  const router = useRouter();
  const isFriendsWalk = walkIsFriendsWalk(walk);

  const handleInvite = () => {
    router.push(`/walks/${walk.id}/invite`);
  };

  return (
    <YStack gap={12}>
      <IconTextRow
        icon={<Users size={16} color="#999" />}
        text={`Waiting for ${isFriendsWalk ? "your friend" : "neighbors"} to join`}
        gap={6}
        right={
          isFriendsWalk &&
          isMine && (
            <WalkCardButton
              label="Invite"
              onPress={handleInvite}
              icon={<Users size={14} color="white" />}
              size="$2"
              backgroundColor={COLORS.primary}
              fontWeight="500"
            />
          )
        }
      />
    </YStack>
  );
};
