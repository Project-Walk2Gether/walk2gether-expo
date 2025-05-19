import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { getDistanceToLocation } from "@/utils/locationUtils";
import { getWalkTitle } from "@/utils/walkType";
import { getWalkStatus } from "@/utils/walkUtils";
import {
  Calendar,
  CheckCircle,
  Clock,
  Hand,
  Pin,
  Timer,
} from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";
import { UserAvatar } from "../UserAvatar";
import WalkAttachmentsCarousel from "../WalkAttachmentsCarousel";
import WalkMenu from "../WalkMenu";
import { ParticipantsSection } from "./ParticipantsSection";

// Props interface for WalkCard
interface Props {
  walk: WithId<Walk>;
  showAttachments?: boolean;
  showActions?: boolean;
  onPress?: () => void;
  hideInviteOption?: boolean;
}

const WalkCard: React.FC<Props> = ({
  walk,
  showAttachments = false,
  showActions = false,
  onPress,
  hideInviteOption = false,
}) => {
  const {
    coords,
    loading: locationLoading,
    error: locationError,
  } = useLocation();
  const { user } = useAuth();
  const isMine = user?.uid === walk.createdByUid;
  const status = getWalkStatus(walk);
  const router = useRouter();

  // Get the participant document for the current user (if they exist as a participant)
  const { doc: participantDoc } = useDoc<Participant>(
    user?.uid ? `walks/${walk.id}/participants/${user.uid}` : undefined
  );

  // Determine the request status of the current user
  const hasRequested = !!participantDoc;
  const isApproved =
    participantDoc?.approvedAt !== null &&
    participantDoc?.approvedAt !== undefined;
  const isCancelled =
    participantDoc?.cancelledAt !== null &&
    participantDoc?.cancelledAt !== undefined;
  const isRejected =
    participantDoc?.rejectedAt !== null &&
    participantDoc?.rejectedAt !== undefined;
  const isPending = hasRequested && !isApproved && !isCancelled && !isRejected;
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
    >
      {/* Attachments Carousel - Not pressable */}
      {showAttachments && <WalkAttachmentsCarousel walk={walk} />}

      {/* Card Content - Pressable */}
      <YStack
        gap="$2"
        pb="$3"
        px="$3"
        pt="$2"
        pressStyle={{ scale: 0.98 }}
        onPress={onPress}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap={8} flex={1}>
            <UserAvatar uid={walk.createdByUid} size={32} />
            <Text
              fontSize={18}
              fontWeight="600"
              color="$gray12"
              numberOfLines={1}
              ellipsizeMode="tail"
              flex={1}
            >
              {getWalkTitle(walk, user?.uid)}
            </Text>
          </XStack>

          {/* Simple menu button that triggers the global menu context */}
          {isMine && <WalkMenu walk={walk} hideInviteOption={hideInviteOption} />}
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
        </XStack>
        <XStack alignItems="center" gap={6}>
          <Timer size={16} color="#666" />
          <Text fontSize={14} color="#666">
            {walk.durationMinutes} minutes
          </Text>
        </XStack>
        {locationDisplay}

        {/* Actions footer */}
        <XStack alignItems="center" gap="$2">
          {isMine ? (
            /* Show participants row only if current user is the walk owner */
            <ParticipantsSection walk={walk} currentUserUid={user?.uid} />
          ) : showActions ? (
            /* Request status or Join button */
            <>
              {/* If user has requested to join and it's approved */}
              {isApproved && (
                <XStack
                  backgroundColor="$green4"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$3"
                  alignItems="center"
                  gap="$1"
                  mt="$2"
                  flex={1}
                >
                  <CheckCircle size={16} color="$green9" />
                  <Text fontSize={12} fontWeight="600" color="$green9">
                    Request accepted!
                  </Text>
                </XStack>
              )}
              
              {/* If user has requested to join and it's rejected */}
              {isRejected && (
                <XStack
                  backgroundColor="$gray4"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$3"
                  alignItems="center"
                  gap="$1"
                  mt="$2"
                  flex={1}
                >
                  <Text fontSize={12} fontWeight="600" color="$gray9">
                    Your request wasn't accepted this time
                  </Text>
                </XStack>
              )}

              {/* If user has requested to join and it's pending */}
              {isPending && (
                <XStack
                  backgroundColor="$yellow8"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$3"
                  alignItems="center"
                  gap="$2"
                  mt="$2"
                  flex={1}
                >
                  <Clock size={16} />
                  <Text fontSize={12} fontWeight="600">
                    You requested to join
                  </Text>
                </XStack>
              )}

              {/* Show join button if user hasn't requested or request was cancelled/rejected */}
              {(!hasRequested || isCancelled || isRejected) &&
                walkIsNeighborhoodWalk(walk) &&
                status !== "past" && (
                  <Button
                    backgroundColor={COLORS.primary}
                    size="$3"
                    flex={1}
                    mt="$2"
                    onPress={onPress}
                    icon={<Hand color="white" />}
                  >
                    <Text fontSize={12} fontWeight="bold" color="white">
                      Ask to join
                    </Text>
                  </Button>
                )}
            </>
          ) : null}
        </XStack>
      </YStack>
    </Card>
  );
};

export default WalkCard;
