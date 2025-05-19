import { COLORS } from "@/styles/colors";
import { useQuery } from "@/utils/firestore";
import { getWalkStatus } from "@/utils/walkUtils";
import { UserPlus, Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Avatar, Button, Text, View, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  WithId,
  walkIsFriendsWalk,
} from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
}

export const ParticipantsSection: React.FC<Props> = ({
  walk,
  currentUserUid,
}) => {
  const router = useRouter();
  const status = getWalkStatus(walk);

  // Fetch participants directly in this component
  const { docs: participants } = useQuery<Participant>(
    walk._ref.collection("participants")
  );

  // Separate approved and pending participants
  const approvedParticipants = participants.filter(
    (p) => p.approvedAt && p.userUid !== currentUserUid
  );
  const pendingParticipants = participants.filter(
    (p) => !p.approvedAt && !p.rejectedAt && p.userUid !== currentUserUid
  );

  // Get counts
  const approvedCount = approvedParticipants.length;
  const unapprovedCount = pendingParticipants.length;

  // For the avatar display, always show approved participants, limited to maxAvatars
  const maxAvatars = 5;
  const avatarsToDisplay = approvedParticipants.slice(0, maxAvatars);
  const overflow = approvedCount > maxAvatars ? approvedCount - maxAvatars : 0;

  return (
    <YStack gap={12} flex={1}>
      {/* Approved participant avatars */}
      <XStack alignItems="center" gap={8}>
        <XStack alignItems="center" gap={4}>
          <Users size={16} color="#666" />
        </XStack>
        <XStack justifyContent="flex-start" gap={-10} flex={1}>
          {avatarsToDisplay.length > 0 ? (
            <>
              {avatarsToDisplay.map((participant, index) => (
                <Avatar
                  key={participant.id || index}
                  size={32}
                  circular
                  borderColor="white"
                  borderWidth={2}
                >
                  <Avatar.Image src={participant.photoURL || undefined} />
                  <Avatar.Fallback
                    justifyContent="center"
                    alignItems="center"
                    backgroundColor={COLORS.primary}
                  >
                    <Text color="white">
                      {(participant.displayName || "A").charAt(0).toUpperCase()}
                    </Text>
                  </Avatar.Fallback>
                </Avatar>
              ))}
              {overflow > 0 && (
                <View
                  backgroundColor={COLORS.primary}
                  width={32}
                  height={32}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                  borderColor="white"
                  borderWidth={2}
                >
                  <Text
                    fontSize={11}
                    color="white"
                    fontWeight="bold"
                  >{`+${overflow}`}</Text>
                </View>
              )}
              <Text fontSize={13} color="#666" ml={16} alignSelf="center">
                {approvedCount}{" "}
                {approvedCount === 1 ? "participant" : "participants"}
              </Text>
            </>
          ) : (
            <Text fontSize={14} color="#666">
              {walkIsFriendsWalk(walk) && pendingParticipants.length > 0
                ? `You invited: ${pendingParticipants
                    .map((p) => p.displayName || "Unknown")
                    .join(", ")}`
                : walkIsFriendsWalk(walk)
                ? "Just you so far"
                : "No neighbors joined yet"}
            </Text>
          )}
        </XStack>
      </XStack>

      {/* Invited participants (pending) avatars */}
      {pendingParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack alignItems="center" gap={4}>
            <UserPlus size={16} color="#666" />
            <Text fontSize={14} fontWeight="600" color="$gray10">
              Invited:
            </Text>
          </XStack>
          <XStack justifyContent="flex-start" gap={-10} flex={1}>
            {pendingParticipants.map((participant, index) => (
              <Avatar
                key={participant.id || index}
                size={32}
                circular
                borderColor="white"
                borderWidth={2}
                opacity={0.7}
              >
                <Avatar.Image src={participant.photoURL || undefined} />
                <Avatar.Fallback
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor={COLORS.primary}
                >
                  <Text color="white">
                    {(participant.displayName || "A").charAt(0).toUpperCase()}
                  </Text>
                </Avatar.Fallback>
              </Avatar>
            ))}
            <Text fontSize={13} color="#666" ml={16} alignSelf="center">
              {pendingParticipants.length}{" "}
              {pendingParticipants.length === 1 ? "invited" : "invited"}
            </Text>
          </XStack>
        </XStack>
      )}

      {/* Approval notification for walk owner */}
      {status !== "past" && unapprovedCount > 0 && (
        <XStack flexShrink={1} alignItems="center" gap={8} py={4}>
          <View
            backgroundColor="rgba(230, 126, 34, 0.15)"
            borderRadius={8}
            paddingHorizontal={10}
            paddingVertical={6}
            flex={1}
          >
            <Text fontWeight="600" fontSize={13} color="#e67e22">
              {unapprovedCount} {unapprovedCount === 1 ? "person" : "people"}{" "}
              waiting for approval
            </Text>
          </View>
          <Button
            size="$2"
            backgroundColor="#e67e22"
            color="white"
            onPress={() =>
              router.push({
                pathname: "/walks/[id]",
                params: { id: walk.id, tab: "waiting-room" },
              })
            }
            borderRadius={8}
            px={12}
            py={4}
          >
            <Text color="white" fontWeight="bold" fontSize={13}>
              See requests
            </Text>
          </Button>
        </XStack>
      )}
    </YStack>
  );
};
