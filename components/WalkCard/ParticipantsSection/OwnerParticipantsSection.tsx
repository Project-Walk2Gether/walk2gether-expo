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
      flex={1}>
      {/* Accepted participants */}
      {acceptedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack alignItems="center" gap={4}>
            <Users size={16} color="#666" />
            <Text fontSize={14} fontWeight="600" color="$gray10">
              {acceptedParticipants.length === 1 ? "Joined" : "Joined"}: 
            </Text>
          </XStack>
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
              {formatNamesInSentenceCase(acceptedParticipants.map(p => p.displayName || "Someone"))}
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
          <XStack alignItems="center" gap={4}>
            <Users size={16} color="#666" />
          </XStack>
          <Text fontSize={14} color="#666">
            {isFriendsWalk ? "Just you so far" : "No neighbors joined yet"}
          </Text>
        </XStack>
      )}

      {/* Invited friends */}
      {invitedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack alignItems="center" gap={4}>
            <UserPlus size={16} color="#666" />
            <Text fontSize={14} fontWeight="600" color="$gray10">
              Invited:
            </Text>
          </XStack>
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
                  <Text
                    fontSize={11}
                    color="white"
                    fontWeight="bold"
                  >{`+${invitedParticipants.length - 3}`}</Text>
                </View>
              )}
            </XStack>
            <Text fontSize={14} color="#666" ml={10} flex={1}>
              {formatNamesInSentenceCase(invitedParticipants.map(p => p.displayName || "Someone"))}
            </Text>
          </XStack>
        </XStack>
      )}
      
      {/* Notified neighbors */}
      {notifiedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack alignItems="center" gap={4}>
            <UserPlus size={16} color="#666" />
            <Text fontSize={14} fontWeight="600" color="$gray10">
              Notified:
            </Text>
          </XStack>
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
                  <Text
                    fontSize={11}
                    color="white"
                    fontWeight="bold"
                  >{`+${notifiedParticipants.length - 3}`}</Text>
                </View>
              )}
            </XStack>
            <Text fontSize={14} color="#666" ml={10} flex={1}>
              {formatNamesInSentenceCase(notifiedParticipants.map(p => p.displayName || "Someone"))}
            </Text>
          </XStack>
        </XStack>
      )}
      
      {/* Requested to join */}
      {requestedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack alignItems="center" gap={4}>
            <UserPlus size={16} color="#666" />
            <Text fontSize={14} fontWeight="600" color="$gray10">
              Requested:
            </Text>
          </XStack>
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
                  <Text
                    fontSize={11}
                    color="white"
                    fontWeight="bold"
                  >{`+${requestedParticipants.length - 3}`}</Text>
                </View>
              )}
            </XStack>
            <Text fontSize={14} color="#666" ml={10} flex={1}>
              {formatNamesInSentenceCase(requestedParticipants.map(p => p.displayName || "Someone"))}
            </Text>
          </XStack>
        </XStack>
      )}

      {/* Denied participants */}
      {deniedParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack alignItems="center" gap={4}>
            <UserPlus size={16} color="#666" />
            <Text fontSize={14} fontWeight="600" color="$gray10">
              Denied:
            </Text>
          </XStack>
          <Text fontSize={14} color="#666" flex={1}>
            {formatNamesInSentenceCase(deniedParticipants.map(p => p.displayName || "Someone"))}
          </Text>
        </XStack>
      )}
      
      {/* Cancelled participants */}
      {cancelledParticipants.length > 0 && (
        <XStack alignItems="center" gap={8}>
          <XStack alignItems="center" gap={4}>
            <UserPlus size={16} color="#666" />
            <Text fontSize={14} fontWeight="600" color="$gray10">
              Cancelled:
            </Text>
          </XStack>
          <Text fontSize={14} color="#666" flex={1}>
            {formatNamesInSentenceCase(cancelledParticipants.map(p => p.displayName || "Someone"))}
          </Text>
        </XStack>
      )}

      {/* Request notification for walk owner */}
      {status !== "past" && requestedParticipants.length > 0 && (
        <XStack flexShrink={1} alignItems="center" gap={8} py={4}>
          <View
            backgroundColor="rgba(230, 126, 34, 0.15)"
            borderRadius={8}
            paddingHorizontal={10}
            paddingVertical={6}
            flex={1}
          >
            <Text fontWeight="600" fontSize={13} color="#e67e22">
              {requestedParticipants.length} {requestedParticipants.length === 1 ? "person" : "people"}{" "}
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
