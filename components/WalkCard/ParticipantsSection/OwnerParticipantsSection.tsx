import { COLORS } from "@/styles/colors";
import { getWalkStatus } from "@/utils/walkUtils";
import { UserPlus, Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Avatar, Button, Text, View, XStack, YStack } from "tamagui";
import { Participant, Walk, WithId, walkIsFriendsWalk } from "walk2gether-shared";

/**
 * Format an array of names into a sentence case string (e.g., "Mary, Sue and Bob")
 */
const formatNamesInSentenceCase = (names: string[]): string => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  
  // For 3+ names: "Name1, Name2, ... and NameN"
  const lastIndex = names.length - 1;
  const firstPart = names.slice(0, lastIndex).join(", ");
  return `${firstPart} and ${names[lastIndex]}`;
};

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
  approvedParticipants: WithId<Participant>[];
  pendingParticipants: WithId<Participant>[];
  invitedParticipants: WithId<Participant>[];
  approvedCount: number;
  pendingCount: number;
  unapprovedCount: number;
  avatarsToDisplay: WithId<Participant>[];
  overflow: number;
}

/**
 * Participants section shown to the walk owner
 */
export const OwnerParticipantsSection: React.FC<Props> = ({
  walk,
  approvedParticipants,
  pendingParticipants,
  invitedParticipants,
  approvedCount,
  unapprovedCount,
  avatarsToDisplay,
  overflow,
}) => {
  const router = useRouter();
  const status = getWalkStatus(walk);

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

      {/* Invited participants */}
      {invitedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack alignItems="center" gap={4}>
            <UserPlus size={16} color="#666" />
            <Text fontSize={14} fontWeight="600" color="$gray10">
              Invited:
            </Text>
          </XStack>
          <XStack justifyContent="flex-start" flex={1}>
            <XStack gap={-10} flexShrink={1}>
              {invitedParticipants.slice(0, 5).map((participant, index) => (
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
              {invitedParticipants.length > 5 && (
                <View
                  backgroundColor={COLORS.primary}
                  width={32}
                  height={32}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                  borderColor="white"
                  borderWidth={2}
                  opacity={0.7}
                >
                  <Text
                    fontSize={11}
                    color="white"
                    fontWeight="bold"
                  >{`+${invitedParticipants.length - 5}`}</Text>
                </View>
              )}
            </XStack>
            <Text fontSize={13} color="#666" ml={16} alignSelf="center" flex={1}>
              {formatNamesInSentenceCase(invitedParticipants.map(p => p.displayName || "Unknown"))}
            </Text>
          </XStack>
        </XStack>
      )}
      
      {/* Pending participants (requested) avatars */}
      {pendingParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack alignItems="center" gap={4}>
            <UserPlus size={16} color="#666" />
            <Text fontSize={14} fontWeight="600" color="$gray10">
              Requested:
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
              {pendingParticipants.length === 1 ? "requested" : "requested"}
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
