import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { getWalkTitle } from "@/utils/walkType";
import { getWalkStatus } from "@/utils/walkUtils";
import { Calendar, CheckCircle, Hand, Timer } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import React from "react";
import { Card, Text, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";
import { UserAvatar } from "../UserAvatar";
import WalkAttachmentsCarousel from "../WalkAttachmentsCarousel";
import WalkMenu from "../WalkMenu";
import { CardHeader } from "./CardHeader";
import { IconTextRow } from "./IconTextRow";
import { LocationDisplay } from "./LocationDisplay";
import { ParticipantsDisplay } from "./ParticipantsDisplay";
import { WalkCardButton } from "./WalkCardButton";

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

  // Get owner display name from participantsById if available
  const getOwnerName = () => {
    if (
      walk.participantsById &&
      walk.createdByUid &&
      walk.participantsById[walk.createdByUid]
    ) {
      return (
        walk.participantsById[walk.createdByUid].displayName || "the organizer"
      );
    }
    return "the organizer";
  };
  const ownerName = getOwnerName();
  const status = getWalkStatus(walk);

  // Get the participant document for the current user (if they exist as a participant)
  const { doc: participantDoc } = useDoc<Participant>(
    user?.uid ? `walks/${walk.id}/participants/${user.uid}` : undefined
  );

  // Determine the participant status of the current user
  const hasRequested = !!participantDoc;
  const isApproved =
    participantDoc?.acceptedAt !== null &&
    participantDoc?.acceptedAt !== undefined &&
    !participantDoc?.cancelledAt;
  const isCancelled =
    participantDoc?.cancelledAt !== null &&
    participantDoc?.cancelledAt !== undefined;
  const isRejected =
    participantDoc?.deniedAt !== null && participantDoc?.deniedAt !== undefined;

  // Check if the user is invited (in participantsById but not from a "requested" source)
  const isInvited =
    !isMine && !hasRequested && walk.participantsById && user?.uid
      ? !!walk.participantsById[user.uid] &&
        walk.participantsById[user.uid].sourceType !== "requested"
      : false;
  // Use the extracted LocationDisplay component

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
      // Reduce opacity for cancelled walks
      opacity={!isMine && isCancelled ? 0.7 : 1}
    >
      {/* Attachments Carousel - Not pressable */}
      {showAttachments && <WalkAttachmentsCarousel walk={walk} />}

      {/* Card Content - Pressable */}
      <YStack
        pb="$3"
        px="$4"
        pt="$2"
        pressStyle={{ scale: 0.98 }}
        onPress={onPress}
      >
        <CardHeader
          icon={<UserAvatar uid={walk.createdByUid} size={32} />}
          title={getWalkTitle(walk, user?.uid)}
          action={
            isMine && (
              <WalkMenu walk={walk} hideInviteOption={hideInviteOption} />
            )
          }
        />
        <IconTextRow
          icon={<Calendar size={16} color="#999" />}
          text={format(walk.date.toDate(), "EEE, MMM d 'at' h:mm a")}
          right={
            status === "active" ? (
              <XStack
                paddingHorizontal={8}
                paddingVertical={4}
                borderRadius={4}
                alignItems="center"
                justifyContent="center"
                borderColor="#4caf50"
                borderWidth={1}
              >
                <Text fontSize={12} color="#4caf50" fontWeight="500">
                  Happening now!
                </Text>
              </XStack>
            ) : undefined
          }
        />
        <IconTextRow
          icon={<Timer size={16} color="#999" />}
          text={`${walk.durationMinutes} minutes`}
        />
        <LocationDisplay
          walk={walk}
          userCoords={coords}
          locationLoading={locationLoading}
          locationError={locationError}
          isApproved={isApproved}
          isMine={isMine}
        />
        {/* Participants section */}
        <YStack gap="$2">
          {/* If user has cancelled their participation */}
          {isCancelled && (
            <XStack
              backgroundColor="$gray4"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$3"
              alignItems="center"
              gap="$1"
            >
              <Text fontSize={12} fontWeight="600" color="$gray9">
                You've told {ownerName} you can't make it
              </Text>
            </XStack>
          )}

          {/* Unified participants display component */}
          <ParticipantsDisplay
            walk={walk}
            currentUserUid={user?.uid}
            isMine={isMine}
          />

          {/* Show action buttons for non-owners when showActions is true */}
          {!isMine && showActions ? (
            <>
              {/* If user is approved - show "See walk details" button */}
              {isApproved && (
                <WalkCardButton
                  label="See walk details"
                  onPress={onPress}
                  icon={<CheckCircle color="white" size={16} />}
                  size="$3"
                  fontWeight="bold"
                  backgroundColor={COLORS.primary}
                />
              )}

              {/* If user has been invited but hasn't responded */}
              {isInvited && !isApproved && !isRejected && !isCancelled && (
                <WalkCardButton
                  label="Respond to invitation"
                  onPress={onPress}
                  icon={<Hand color="white" size={16} />}
                  size="$3"
                  fontWeight="bold"
                  backgroundColor={COLORS.primary}
                />
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
              {/* Show join button for neighborhood walks if user hasn't requested or request was rejected */}
              {/* Don't show if the user is already approved or has cancelled */}
              {(!hasRequested || isRejected) &&
                !isApproved &&
                !isCancelled &&
                walkIsNeighborhoodWalk(walk) &&
                !isInvited &&
                status !== "past" && (
                  <WalkCardButton
                    label="Join this walk"
                    onPress={onPress}
                    icon={<Hand color="white" size={16} />}
                    size="$3"
                    fontWeight="bold"
                    backgroundColor={COLORS.primary}
                  />
                )}
            </>
          ) : null}
        </YStack>
      </YStack>
    </Card>
  );
};

export default WalkCard;
