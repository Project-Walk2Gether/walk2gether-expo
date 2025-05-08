import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { COLORS } from "@/styles/colors";
import { useQuery } from "@/utils/firestore";
import { getDistanceToLocation } from "@/utils/locationUtils";
import { getWalkTypeLabel } from "@/utils/walkType";
import { getWalkStatus } from "@/utils/walkUtils";
import { Calendar, Hand, Pin, Timer } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { Avatar, Button, Card, Text, View, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";
import { UserAvatar } from "../UserAvatar";
import WalkAttachmentsCarousel from "../WalkAttachmentsCarousel";

// Props interface for WalkCard
interface WalkCardProps {
  walk: WithId<Walk>;
  showAttachments?: boolean;
}

const WalkCard: React.FC<WalkCardProps> = ({
  walk,
  showAttachments = false,
}) => {
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
  const router = useRouter();
  const handlePress = () => {
    // If user is the walk owner, always go to walk details
    router.push({ pathname: `/walks/[id]`, params: { id: walk.id } });
  };

  // Calculate the distance and prepare the location display text
  const locationDisplay = (() => {
    if (walkIsNeighborhoodWalk(walk)) return null;

    const locationName = walk.currentLocation?.name || "";
    let displayContent;

    if (coords) {
      const distance = getDistanceToLocation({
        targetLocation: walk.currentLocation,
        userCoords: coords,
        loading: locationLoading,
        error: locationError,
      });

      if (distance) {
        displayContent = (
          <>
            {locationName}{" "}
            <Text fontSize={13} color="#888" fontWeight="500">
              ({distance})
            </Text>
          </>
        );
      } else {
        displayContent = locationName;
      }
    } else {
      displayContent = locationName;
    }

    if (!displayContent) return null;

    return (
      <XStack alignItems="center" gap={6}>
        <Pin size={16} color="#666" />
        <Text fontSize={14} color="#666" numberOfLines={1}>
          {displayContent}
        </Text>
      </XStack>
    );
  })();

  return (
    <Card
      borderRadius={14}
      backgroundColor="#fff"
      shadowColor="#000"
      shadowOpacity={0.06}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 2 }}
      marginVertical={10}
      borderTopLeftRadius={18}
      borderTopRightRadius={18}
      animation="bouncy"
      overflow="hidden"
      // Remove onPress from the main card
    >
      {/* Attachments Carousel - Not pressable */}
      {showAttachments && <WalkAttachmentsCarousel walk={walk} />}

      {/* Card Content - Pressable */}
      <YStack
        gap="$2"
        pb="$3"
        px="$3"
        pt="$2"
        flex={1}
        pressStyle={{ scale: 0.98 }}
        onPress={handlePress}
      >
        <XStack
          alignItems="center"
          justifyContent="space-between"
          flexShrink={0}
        >
          <XStack alignItems="center" gap={8}>
            <UserAvatar uid={walk.createdByUid} size={32} />
            <Text
              fontSize={18}
              fontWeight="600"
              color="$gray12"
              numberOfLines={1}
              ellipsizeMode="tail"
              flex={1}
            >
              {isMine
                ? "Your " + getWalkTypeLabel(walk.type)
                : `${walk.organizerName}'s Friend walk`}
            </Text>
          </XStack>
        </XStack>

        <XStack alignItems="center" gap={6} justifyContent="space-between">
          <XStack alignItems="center" gap={6}>
            <Calendar size={16} color="#666" />
            <Text fontSize={14} color="#666">
              {format(walk.date.toDate(), "EEE, MMM d 'at' h:mm a")}
            </Text>
          </XStack>
          {status === "active" && (
            <XStack
              backgroundColor="#4caf50"
              paddingHorizontal={8}
              paddingVertical={4}
              borderRadius={4}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={12} color="white" fontWeight="500">
                Happening now!
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
        <XStack alignItems="center" gap={6}>
          <Timer size={16} color="#666" />
          <Text fontSize={14} color="#666">
            {walk.durationMinutes} minutes
          </Text>
        </XStack>
        {locationDisplay}

        {/* Actions footer */}
        {avatarsToDisplay.length > 0 && (
          <XStack alignItems="center" gap="$2">
            <XStack flexDirection="column" gap={8}>
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
                        <Avatar.Fallback
                          justifyContent="center"
                          alignItems="center"
                          backgroundColor={COLORS.primary}
                        >
                          <Text color="white">
                            {(participant.displayName || "A")
                              .charAt(0)
                              .toUpperCase()}
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
                    <Text
                      fontSize={13}
                      color="$gray9"
                      ml={16}
                      alignSelf="center"
                    >
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
      </YStack>
    </Card>
  );
};

export default WalkCard;
