import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { COLORS } from "@/styles/colors";
import { getSmartDateFormat } from "@/utils/dateUtils";
import { useDoc } from "@/utils/firestore";
import { calculateDisplayAvatars } from "@/utils/participantAvatars";
import { getWalkTitle } from "@/utils/walkType";
import { getWalkStatus } from "@/utils/walkUtils";
import { Timestamp } from "@react-native-firebase/firestore";
import {
  Calendar,
  CheckCircle,
  Hand,
  MessageCircle,
  Timer,
} from "@tamagui/lucide-icons";
import React from "react";
import { Button, Text, View, XStack, YStack } from "tamagui";
import {
  Participant,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";
import { UserAvatar } from "../UserAvatar";
import WalkAttachmentsCarousel from "../WalkAttachmentsCarousel";
import WalkCardWrapper from "../WalkCardWrapper";
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
  canShowDismissButton?: boolean;
  showActions?: boolean;
  onPress?: () => void;
}

const WalkCard: React.FC<Props> = ({
  walk,
  showAttachments = false,
  canShowDismissButton = true,
  showActions = false,
  onPress,
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

  // Determine if the walk is happening now (more precise than just 'active' status)
  const isHappeningNow = React.useMemo(() => {
    const now = new Date();
    
    // Check if date is in the past
    if (walk.date) {
      const walkDate = walk.date.toDate();
      if (now >= walkDate) return true;
    }
    
    // Check if startedAt is set and in the past
    if (walk.startedAt) {
      const startTime = walk.startedAt.toDate();
      if (now >= startTime) return true;
    }
    
    // Neither date nor startedAt indicates the walk is happening now
    return false;
  }, [walk.date, walk.startedAt]);

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

  // Check if the current user has accepted the invitation (logic moved from ParticipantsDisplay)
  const currentUserHasAccepted = React.useMemo(() => {
    if (!user?.uid || isMine) return true; // Owner or no user ID - not relevant

    return (
      participantDoc?.acceptedAt !== undefined &&
      participantDoc.acceptedAt !== null
    );
  }, [user?.uid, isMine, participantDoc]);

  // Calculate display avatars using the utility function
  const { displayAvatars, overflow, hasNonOwnerParticipants } =
    React.useMemo(() => {
      return calculateDisplayAvatars(walk, user?.uid, isMine);
    }, [walk, user?.uid, isMine]);

  // Determine if we should show the participants display
  const shouldShowParticipantsDisplay =
    isMine || (currentUserHasAccepted && hasNonOwnerParticipants);

  // Determine the walk type for color styling
  const walkType = walk.type;

  const handleHideInvitationButtonPress = () => {
    participantDoc?._ref.update({ hiddenAt: Timestamp.now() });
    walk._ref.update({
      [`participantsById.${user?.uid}.hiddenAt`]: Timestamp.now(),
    });
  };

  return (
    <YStack marginVertical={10} opacity={!isMine && isCancelled ? 0.85 : 1}>
      {/* Attachments Carousel - Not pressable */}
      {showAttachments && <WalkAttachmentsCarousel walk={walk} />}

      {/* Card Content - Pressable */}
      <WalkCardWrapper
        type={walkType}
        onPress={onPress}
        elevation={3}
        animation={true}
      >
        <CardHeader
          icon={<UserAvatar uid={walk.createdByUid} size={34} />}
          title={getWalkTitle(walk, user?.uid)}
          walkType={
            walk.type === "neighborhood"
              ? "Neighborhood"
              : walk.type === "meetup"
              ? "Meetup"
              : "Friends"
          }
          isUserInitiator={isMine}
          initiatorName={ownerName}
          action={isMine && <WalkMenu walk={walk} />}
        />
        <IconTextRow
          icon={<Calendar size={16} color="#444" />}
          text={getSmartDateFormat(walk.date.toDate())}
          textWeight="bold"
          right={
            isHappeningNow ? (
              <XStack
                paddingHorizontal={8}
                paddingVertical={4}
                borderRadius={4}
                alignItems="center"
                justifyContent="center"
                borderColor="#4caf50"
                borderWidth={1}
              >
                <Text fontSize={12} color="#0a5c0a" fontWeight="500">
                  Happening now!
                </Text>
              </XStack>
            ) : undefined
          }
        />
        <IconTextRow
          icon={<Timer size={16} color="#444" />}
          text={`${walk.durationMinutes} minutes`}
        />
        {/* Show topic for meetup walks */}
        {walk.type === "meetup" && walk.topic && (
          <IconTextRow
            icon={<MessageCircle size={16} />}
            text={`Topic: ${walk.topic}`}
          />
        )}
        <LocationDisplay
          walk={walk}
          userCoords={coords}
          locationLoading={locationLoading}
          locationError={locationError}
        />
        {/* You're going section - only shows for participants who aren't the owner */}
        {isApproved && !isMine && (
          <IconTextRow
            icon={<CheckCircle size={16} color="#4CAF50" />}
            text="You're going!"
            textColor="#4CAF50"
            textWeight="bold"
          />
        )}
        {/* Participants section */}
        <YStack gap="$2">
          {/* If user has cancelled their participation */}
          {isCancelled && (
            <YStack gap="$2">
              <XStack
                backgroundColor="$red7"
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
                alignItems="center"
                gap="$1"
                mt="$2"
              >
                <Text fontSize={12} fontWeight="600">
                  You've told {ownerName} you can't make it
                </Text>
              </XStack>
              {canShowDismissButton ? (
                <Button onPress={handleHideInvitationButtonPress}>
                  Hide this invitation
                </Button>
              ) : null}
            </YStack>
          )}

          {/* Unified participants display component - only render if conditions are met */}
          {shouldShowParticipantsDisplay && (
            <ParticipantsDisplay
              walk={walk}
              currentUserUid={user?.uid}
              isMine={isMine}
              displayAvatars={displayAvatars}
              overflow={overflow}
            />
          )}

          {/* Show action buttons for non-owners when showActions is true */}
          {!isMine && showActions && !isCancelled ? (
            <>
              {/* If user has not responded */}
              {!isApproved && !isRejected && !isCancelled && (
                <View mt="$3">
                  <WalkCardButton
                    label="Respond to invitation"
                    onPress={onPress}
                    icon={<Hand color="white" size={16} />}
                    size="$3"
                    fontWeight="bold"
                    backgroundColor={COLORS.primary}
                  />
                </View>
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
      </WalkCardWrapper>
    </YStack>
  );
};

export default WalkCard;
