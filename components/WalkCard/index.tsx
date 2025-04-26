import { Calendar, Hand, Pin, Timer, User } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { Avatar, Button, Card, Text, View, XStack, YStack } from "tamagui";
import { getWalkTypeLabel } from "utils/walkType";
import {
  Participant,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "../../context/LocationContext";
import { COLORS } from "../../styles/colors";
import { useQuery } from "../../utils/firestore";
import { getWalkStatus } from "../../utils/walkUtils";
import { getDistanceFromLocation } from "./utils/locationUtils";

// Props interface for WalkCard
interface WalkCardProps {
  walk: WithId<Walk>;
}

const WalkCard: React.FC<WalkCardProps> = ({ walk }) => {
  const {
    coords,
    loading: locationLoading,
    error: locationError,
  } = useLocation();
  const { user } = useAuth();
  const isMine = user?.uid === walk.createdByUid;
  const { docs: participants } = useQuery<Participant>(
    walk._ref.collection("participants")
  );

  // Separate approved and pending participants
  const approvedParticipants = participants.filter((p) => p.approvedAt);
  const pendingParticipants = participants.filter(
    (p) => !p.approvedAt && p.userUid !== user?.uid
  );

  // Get counts
  const approvedCount = approvedParticipants.length;
  const unapprovedCount = pendingParticipants.length;

  // For the avatar display, always show approved participants, limited to maxAvatars
  const maxAvatars = 5;
  const avatarsToDisplay = approvedParticipants.slice(0, maxAvatars);
  const overflow = approvedCount > maxAvatars ? approvedCount - maxAvatars : 0;
  const status = getWalkStatus(walk);

  const organizerNameText = isMine
    ? status === "past"
      ? "You hosted"
      : "You're hosting"
    : walk.organizerName + "'s walk";
  const router = useRouter();
  const handlePress = () => {
    // If user is the walk owner, always go to walk details
    router.push(`/walk/${walk.id}`);
  };
  const distanceFromMe = getDistanceFromLocation({
    location: walk.location,
    coords,
    loading: locationLoading,
    error: locationError,
  });

  return (
    <Card
      borderRadius={14}
      backgroundColor="#fff"
      shadowColor="#000"
      shadowOpacity={0.06}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 2 }}
      marginVertical={10}
      pressStyle={{ scale: 0.98 }}
      borderTopLeftRadius={18}
      borderTopRightRadius={18}
      animation="bouncy"
      onPress={handlePress}
    >
      {/* Walk Card Header */}
      <YStack space="$1" px="$3" pt="$2" pb="$3" flex={1}>
        <XStack
          p="$2"
          alignItems="center"
          justifyContent="space-between"
          flexShrink={0}
        >
          <XStack alignItems="center" gap={8}>
  <Text
    fontSize={18}
    fontWeight="600"
    color="$gray12"
    numberOfLines={1}
    ellipsizeMode="tail"
    flex={1}
  >
    {isMine
      ? "Friend walk"
      : `${walk.organizerName}'s Friend walk`}
  </Text>
  {isMine && (
  <XStack
    backgroundColor={COLORS.primary}
    px={8}
    py={4}
    borderRadius={4}
    alignItems="center"
    justifyContent="center"
    ml={4}
  >
    <Text fontSize={12} color="white" fontWeight="500">
      {status === "past" ? "You hosted" : "You're hosting"}
    </Text>
  </XStack>
)}
{status === "active" && (
  <XStack
    backgroundColor="#4caf50"
    paddingHorizontal={8}
    paddingVertical={4}
    borderRadius={4}
    alignItems="center"
    justifyContent="center"
    ml={4}
  >
    <Text fontSize={12} color="white" fontWeight="500">
      Active
    </Text>
  </XStack>
)}
{status !== "active" && status !== "past" && (
  <XStack
    backgroundColor="#2196f3"
    paddingHorizontal={8}
    paddingVertical={4}
    borderRadius={4}
    alignItems="center"
    justifyContent="center"
    ml={4}
  >
    <Text fontSize={12} color="white" fontWeight="500">
      Upcoming
    </Text>
  </XStack>
)}
</XStack>
        </XStack>

        
        <XStack alignItems="center" gap={6}>
          <Calendar size={16} color="#666" />
          <Text fontSize={14} color="#666">
            {format(walk.date.toDate(), "EEE, MMM d 'at' h:mm a")}
          </Text>
        </XStack>
        <XStack alignItems="center" gap={6}>
          <Timer size={16} color="#666" />
          <Text fontSize={14} color="#666">
            {walk.durationMinutes} minutes
          </Text>
        </XStack>
        <XStack alignItems="center" gap={6}>
          <Pin size={16} color="#666" />
          <Text fontSize={14} color="#666" numberOfLines={1}>
            {walkIsNeighborhoodWalk(walk) ? distanceFromMe : walk.location.name}
          </Text>
        </XStack>
      </YStack>

      {/* Actions footer */}
      {avatarsToDisplay.length > 0 && (
        <XStack py="$3" alignItems="center" gap="$2" paddingHorizontal={12}>
          <XStack flexDirection="column" gap={8} mt={8}>
            {/* Approved participant avatars */}
            <XStack justifyContent="flex-start" gap={-10}>
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
                      <Avatar.Fallback backgroundColor={COLORS.primary}>
                        {(participant.displayName || "A")
                          .charAt(0)
                          .toUpperCase()}
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
                  <Text fontSize={13} color="$gray9" ml={16} alignSelf="center">
                    {approvedCount}{" "}
                    {approvedCount === 1 ? "participant" : "participants"}
                  </Text>
                </>
              ) : (
                <Text fontSize={13} color="$gray9">
                  No participants yet
                </Text>
              )}
            </XStack>
          </XStack>

          {/* Only show pending participants for active or upcoming walks, and only if you're the owner */}
          {isMine && status !== "past" && unapprovedCount > 0 ? (
            <XStack flexShrink={1} alignItems="center" gap={8} py={4} mt={4}>
              <View
                backgroundColor="rgba(230, 126, 34, 0.15)"
                borderRadius={8}
                paddingHorizontal={10}
                paddingVertical={6}
                flex={1}
              >
                <Text fontWeight="600" fontSize={13} color="#e67e22">
                  {unapprovedCount}{" "}
                  {unapprovedCount === 1 ? "person" : "people"} waiting for
                  approval
                </Text>
              </View>
              <Button
                size="$2"
                backgroundColor="#e67e22"
                color="white"
                onPress={() => router.push(`/walk/${walk.id}/waiting-room`)}
                borderRadius={8}
                px={12}
                py={4}
              >
                <Text color="white" fontWeight="bold" fontSize={13}>
                  See requests
                </Text>
              </Button>
            </XStack>
          ) : null}
          {isMine ? null : (
            <Button
              backgroundColor={COLORS.primary}
              icon={<Hand color="white" />}
              size="$3"
            >
              <Text fontSize={12} fontWeight="bold" color="white">
                Ask to join
              </Text>
            </Button>
          )}
        </XStack>
      )}
    </Card>
  );
};

export default WalkCard;
