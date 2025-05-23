import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { getDistanceToLocation } from "@/utils/locationUtils";
import { getWalkTitle } from "@/utils/walkType";
import { getWalkStatus } from "@/utils/walkUtils";
import { Calendar, CheckCircle, Hand, Pin, Timer } from "@tamagui/lucide-icons";
import { format } from "date-fns";
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
import { IconTextRow } from "./IconTextRow";
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

  // Get the participant document for the current user (if they exist as a participant)
  const { doc: participantDoc } = useDoc<Participant>(
    user?.uid ? `walks/${walk.id}/participants/${user.uid}` : undefined
  );

  // Determine the participant status of the current user
  const hasRequested = !!participantDoc;
  const isApproved =
    participantDoc?.acceptedAt !== null &&
    participantDoc?.acceptedAt !== undefined;
  const isCancelled =
    participantDoc?.cancelledAt !== null &&
    participantDoc?.cancelledAt !== undefined;
  const isRejected =
    participantDoc?.rejectedAt !== null &&
    participantDoc?.rejectedAt !== undefined;

  // Check if the user is invited (in participantsById but not from a "requested" source)
  const isInvited =
    !isMine && !hasRequested && walk.participantsById && user?.uid
      ? !!walk.participantsById[user.uid] &&
        walk.participantsById[user.uid].sourceType !== "requested"
      : false;
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
      <IconTextRow
        icon={<Pin size={16} color="#666" />}
        text={displayContent}
        fontSize={14}
        color="#666"
        gap={6}
        textProps={{ flexShrink: 1 }}
      />
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
          <IconTextRow
            icon={<UserAvatar uid={walk.createdByUid} size={32} />}
            text={getWalkTitle(walk, user?.uid)}
            fontSize={18}
            fontWeight="600"
            color="$gray12"
            numberOfLines={1}
            ellipsizeMode="tail"
            flex={1}
          />

          {/* Simple menu button that triggers the global menu context */}
          {isMine && (
            <WalkMenu walk={walk} hideInviteOption={hideInviteOption} />
          )}
        </XStack>

        <XStack alignItems="center" gap={6} justifyContent="space-between">
          <IconTextRow
            icon={<Calendar size={16} color="#666" />}
            text={format(walk.date.toDate(), "EEE, MMM d 'at' h:mm a")}
            fontSize={14}
            color="#666"
            gap={6}
          />
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
        <IconTextRow
          icon={<Timer size={16} color="#666" />}
          text={`${walk.durationMinutes} minutes`}
          fontSize={14}
          color="#666"
          gap={6}
        />
        {locationDisplay}

        {/* Participants section */}
        <YStack gap="$3" pt="$2">
          {/* Show participants section for all users, it will render the appropriate view internally */}
          <ParticipantsSection walk={walk} currentUserUid={user?.uid} />

          {/* Show action buttons for non-owners when showActions is true */}
          {!isMine && showActions ? (
            <>
              {/* If user is approved - show "See walk details" button */}
              {isApproved && (
                <Button
                  backgroundColor={COLORS.primary}
                  size="$3"
                  flex={1}
                  mt="$2"
                  onPress={onPress}
                  icon={<CheckCircle color="white" size={16} />}
                >
                  <Text fontSize={12} fontWeight="bold" color="white">
                    See walk details
                  </Text>
                </Button>
              )}

              {/* If user has been invited but hasn't responded */}
              {isInvited && !isApproved && !isRejected && !isCancelled && (
                <Button
                  backgroundColor={COLORS.primary}
                  size="$3"
                  flex={1}
                  mt="$2"
                  onPress={onPress}
                  icon={<Hand color="white" size={16} />}
                >
                  <Text fontSize={12} fontWeight="bold" color="white">
                    Respond to invitation
                  </Text>
                </Button>
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

              {/* Show join button for neighborhood walks if user hasn't requested or request was cancelled/rejected */}
              {(!hasRequested || isCancelled || isRejected) &&
                walkIsNeighborhoodWalk(walk) &&
                !isInvited &&
                status !== "past" && (
                  <Button
                    backgroundColor={COLORS.primary}
                    size="$3"
                    flex={1}
                    mt="$2"
                    onPress={onPress}
                    icon={<Hand color="white" size={16} />}
                  >
                    <Text fontSize={12} fontWeight="bold" color="white">
                      Join this walk
                    </Text>
                  </Button>
                )}
            </>
          ) : null}
        </YStack>
      </YStack>
    </Card>
  );
};

export default WalkCard;
