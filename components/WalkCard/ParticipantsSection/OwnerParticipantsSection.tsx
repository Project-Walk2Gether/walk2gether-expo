import { COLORS } from "@/styles/colors";
import { getWalkStatus } from "@/utils/walkUtils";
import { useRouter } from "expo-router";
import React from "react";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  WithId,
  walkIsFriendsWalk,
} from "walk2gether-shared";

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
  acceptedParticipants: WithId<Participant>[];
  requestedParticipants: WithId<Participant>[];
  invitedParticipants: WithId<Participant>[];
  notifiedParticipants: WithId<Participant>[];
  deniedParticipants: WithId<Participant>[];
  cancelledParticipants: WithId<Participant>[];
  avatarsToDisplay: WithId<Participant>[];
  overflow: number;
}

/**
 * Participants section shown to the walk owner
 */
export const OwnerParticipantsSection: React.FC<Props> = ({
  walk,
  acceptedParticipants,
  requestedParticipants,
  invitedParticipants,
  notifiedParticipants,
  deniedParticipants,
  cancelledParticipants,
  avatarsToDisplay,
  overflow,
}) => {
  const router = useRouter();
  const status = getWalkStatus(walk);
  const isFriendsWalk = walkIsFriendsWalk(walk);

  return (
    <YStack
      borderTopWidth={1}
      borderTopColor="$gray4"
      mt={12}
      pt={12}
      gap={16}
      flex={1}
    >
      {/* Accepted participants */}
      {acceptedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack flex={1} alignItems="center">
            <XStack justifyContent="flex-start" gap={-10} flexShrink={1}>
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
            </XStack>
            <Text fontSize={14} color="#666" ml={10} flex={1}>
              {acceptedParticipants.length > 0 
                ? `${formatNamesInSentenceCase(
                  acceptedParticipants.map((p) => p.displayName || "Someone")
                )} ${acceptedParticipants.length === 1 ? "is" : "are"} joining you`
                : ""}
            </Text>
          </XStack>
        </XStack>
      )}

      {/* No participants yet */}
      {acceptedParticipants.length === 0 &&
        invitedParticipants.length === 0 &&
        notifiedParticipants.length === 0 &&
        requestedParticipants.length === 0 && (
          <XStack alignItems="center" gap={8}>
            <Text fontSize={14} color="#666">
              {isFriendsWalk ? "Just you so far" : "No neighbors joined yet"}
            </Text>
          </XStack>
        )}

      {/* Invited friends */}
      {invitedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <Text fontSize={14} fontWeight="600" color="$gray10">
            Invited:
          </Text>
          <XStack flex={1} alignItems="center">
            <XStack justifyContent="flex-start" gap={-10} flexShrink={1}>
              {invitedParticipants.slice(0, 3).map((participant, index) => (
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
              {invitedParticipants.length > 3 && (
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
                  <Text fontSize={11} color="white" fontWeight="bold">{`+${
                    invitedParticipants.length - 3
                  }`}</Text>
                </View>
              )}
            </XStack>
            <Text fontSize={14} color="#666" ml={10} flex={1}>
              {invitedParticipants.length > 0 
                ? `${formatNamesInSentenceCase(
                  invitedParticipants.map((p) => p.displayName || "Someone")
                )} invited to join you`
                : ""}
            </Text>
          </XStack>
        </XStack>
      )}

      {/* Notified neighbors */}
      {notifiedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <Text fontSize={14} fontWeight="600" color="$gray10">
            Notified:
          </Text>
          <XStack flex={1} alignItems="center">
            <XStack justifyContent="flex-start" gap={-10} flexShrink={1}>
              {notifiedParticipants.slice(0, 3).map((participant, index) => (
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
              {notifiedParticipants.length > 3 && (
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
                  <Text fontSize={11} color="white" fontWeight="bold">{`+${
                    notifiedParticipants.length - 3
                  }`}</Text>
                </View>
              )}
            </XStack>
            <Text fontSize={14} color="#666" ml={10} flex={1}>
              {notifiedParticipants.length > 0 
                ? `${formatNamesInSentenceCase(
                  notifiedParticipants.map((p) => p.displayName || "Someone")
                )} notified about your walk`
                : ""}
            </Text>
          </XStack>
        </XStack>
      )}

      {/* Requested to join */}
      {requestedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <Text fontSize={14} fontWeight="600" color="$gray10">
            Requested:
          </Text>
          <XStack flex={1} alignItems="center">
            <XStack justifyContent="flex-start" gap={-10} flexShrink={1}>
              {requestedParticipants.slice(0, 3).map((participant, index) => (
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
              {requestedParticipants.length > 3 && (
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
                  <Text fontSize={11} color="white" fontWeight="bold">{`+${
                    requestedParticipants.length - 3
                  }`}</Text>
                </View>
              )}
            </XStack>
            <Text fontSize={14} color="#666" ml={10} flex={1}>
              {requestedParticipants.length > 0 
                ? `${formatNamesInSentenceCase(
                  requestedParticipants.map((p) => p.displayName || "Someone")
                )} recently joined your walk`
                : ""}
            </Text>
          </XStack>
        </XStack>
      )}

      {/* Denied participants */}
      {deniedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <Text fontSize={14} fontWeight="600" color="$gray10">
            Denied:
          </Text>
          <Text fontSize={14} color="#666" flex={1}>
            {formatNamesInSentenceCase(
              deniedParticipants.map((p) => p.displayName || "Someone")
            )} denied from the walk
          </Text>
        </XStack>
      )}

      {/* Cancelled participants */}
      {cancelledParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <Text fontSize={14} fontWeight="600" color="$gray10">
            Cancelled:
          </Text>
          <Text fontSize={14} color="#666" flex={1}>
            {formatNamesInSentenceCase(
              cancelledParticipants.map((p) => p.displayName || "Someone")
            )} cancelled participation
          </Text>
        </XStack>
      )}

      {/* Display recently joined participants as simple text */}
      {status !== "past" && requestedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <Text fontSize={14} fontWeight="600" color="$gray10">
            Recently joined:
          </Text>
          <Text fontSize={14} color="#666" flex={1}>
            {requestedParticipants.length > 0 
              ? `${formatNamesInSentenceCase(
                requestedParticipants.map((p) => p.displayName || "Someone")
              )} recently joined your walk`
              : ""}
          </Text>
        </XStack>
      )}
    </YStack>
  );
};
