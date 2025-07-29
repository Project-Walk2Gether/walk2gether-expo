import { useAuth } from "@/context/AuthContext";
import { useWalk } from "@/context/WalkContext";
import { router } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import React, { useMemo, useState } from "react";
import { Button, Stack, Text, XStack, YStack } from "tamagui";
import RoundCountdown from "../Rounds/RoundCountdown";
import { differenceInMinutes } from "date-fns";
import { MeetupWalk, walkIsMeetupWalk } from "walk2gether-shared";

interface Props {}

export default function WalkRoundControls({}: Props) {
  const { user } = useAuth();
  const { walk } = useWalk();
  const currentUserId = user?.uid;
  const [isRotating, setIsRotating] = useState(false);

  // Check if the current user is the walk owner
  const isWalkOwner = useMemo(() => {
    if (!walk || !user) return false;
    return walk.createdByUid === user.uid;
  }, [walk, user]);

  // Check if the walk is a MeetupWalk and get upcoming rounds
  const isMeetupWalk = walk ? walkIsMeetupWalk(walk) : false;
  const upcomingRounds = isMeetupWalk && walk
    ? (walk as unknown as MeetupWalk).upcomingRounds || []
    : [];

  // Get activeRound and userPair from context instead of querying directly
  const { activeRound, userPair } = useWalk();

  // Get partner names (excluding current user)
  const partnerNames = useMemo(() => {
    if (!userPair || !walk?.participantsById || !currentUserId) return [];

    // Filter out current user and map to participant names
    return userPair.userUids
      .filter((uid) => uid !== currentUserId)
      .map((uid) => walk.participantsById?.[uid]?.displayName || "Unknown")
      .filter(Boolean);
  }, [userPair, currentUserId, walk?.participantsById]);

  // Navigation function to round detail screen
  const navigateToRoundDetail = () => {
    if (walk?._ref && activeRound && userPair) {
      const walkIdParts = walk._ref.path.split("/");
      const walkId = walkIdParts[walkIdParts.length - 1];
      router.push(`/(app)/(modals)/walk-round?walkId=${walkId}`);
    }
  };

  // Whether the header is tappable (has active round user is part of)
  const isTappable = !!activeRound && !!userPair;

  // Calculate suggested round duration based on remaining time and rounds
  const calculateSuggestedDuration = () => {
    if (!walk || !walk.estimatedEndTime || upcomingRounds.length === 0) {
      return 15; // Default to 15 minutes if we can't calculate
    }

    // Calculate minutes between now and estimated end time
    const now = new Date();
    const estimatedEndTime = walk.estimatedEndTime.toDate();
    const remainingMinutes = differenceInMinutes(estimatedEndTime, now);

    // If we're past the estimated end time, default to 15 minutes
    if (remainingMinutes <= 0) {
      return 15;
    }

    // Divide remaining time by number of upcoming rounds, with a minimum of 5 minutes
    const suggestedDuration = Math.max(
      5,
      Math.floor(remainingMinutes / upcomingRounds.length)
    );

    return suggestedDuration;
  };

  // Handle rotating to the next round
  const handleRotateToNextRound = async () => {
    if (upcomingRounds.length === 0 || !currentUserId || !walk || !isMeetupWalk) {
      return;
    }

    setIsRotating(true);

    try {
      // Get the first upcoming round
      const nextRound = upcomingRounds[0];
      const durationMinutes = calculateSuggestedDuration();

      // Create a batch to perform multiple operations atomically
      const batch = firestore().batch();

      // Reference for the new round document
      const newRoundRef = (walk._ref as any).collection("rounds").doc();

      // Calculate round duration in milliseconds
      const roundDurationMs = durationMinutes * 60 * 1000;

      // Create a new round document in Firestore
      const roundData = {
        ...nextRound,
        createdAt: firestore.FieldValue.serverTimestamp(),
        startTime: firestore.FieldValue.serverTimestamp(),
        // Set endTime based on the selected duration
        endTime: firestore.Timestamp.fromDate(
          new Date(Date.now() + roundDurationMs)
        ),
      };

      // Add the round to the rounds collection
      batch.set(newRoundRef, roundData);

      // Update the walk document to remove the first upcoming round and shift others up
      const updatedUpcomingRounds = [...upcomingRounds.slice(1)];
      batch.update(walk._ref as any, {
        upcomingRounds: updatedUpcomingRounds,
      });

      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error("Error rotating rounds:", error);
    } finally {
      setIsRotating(false);
    }
  };

  // Handle opening the rounds management modal
  const handleOpenRoundsModal = () => {
    if (walk?._ref) {
      const walkIdParts = walk._ref.path.split("/");
      const walkId = walkIdParts[walkIdParts.length - 1];
      router.push({
        pathname: "/(app)/(modals)/walk-rounds-management",
        params: { walkId }
      });
    }
  };

  // Only show content if there's an active round and user pair, or if user is admin
  if (!activeRound && !userPair && !isWalkOwner) {
    return null;
  }

  return (
    <YStack>
      {/* Current Round Display - shown when there's an active round */}
      {activeRound && userPair && (
        <Stack
          px="$2"
          backgroundColor={userPair.color}
          pressStyle={{ opacity: 0.9 }}
          onPress={isTappable ? navigateToRoundDetail : undefined}
          cursor={isTappable ? "pointer" : undefined}
        >
          <YStack width="100%" paddingVertical="$2">
            {/* Center: Large emoji with countdown positioned to the right */}
            <XStack
              width="100%"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <Text fontSize={40} lineHeight={44}>
                {userPair.emoji}
              </Text>
              {activeRound.startTime && (
                <XStack position="absolute" right="$2">
                  <RoundCountdown
                    startTime={activeRound.startTime}
                    endTime={activeRound.endTime}
                  />
                </XStack>
              )}
            </XStack>

            {/* Bottom row: Partner names and question prompt */}
            <YStack
              width="100%"
              paddingHorizontal="$3"
              marginTop="$1"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize={15}
                color="white"
                fontWeight="500"
                textAlign="center"
                textWrap="wrap"
              >
                Look for{" "}
                {partnerNames.length > 0 ? partnerNames.join(", ") : "your partner"}
              </Text>
              {activeRound.questionPrompt && (
                <Text
                  fontSize={13}
                  color="white"
                  opacity={0.9}
                  textAlign="center"
                  marginTop="$1"
                  textWrap="wrap"
                >
                  {activeRound.questionPrompt}
                </Text>
              )}
            </YStack>
          </YStack>
        </Stack>
      )}

      {/* Admin Controls - shown only to walk owners */}
      {isWalkOwner && isMeetupWalk && (
        <YStack px="$2" py="$2" gap="$2" backgroundColor="$gray2">
          <Text fontSize={12} color="$gray10" textAlign="center" fontWeight="500">
            Walk Admin Controls
          </Text>
          
          <XStack gap="$2" justifyContent="center">
            {/* Next Round Button */}
            {upcomingRounds.length > 0 && (
              <Button
                size="$3"
                theme="blue"
                onPress={handleRotateToNextRound}
                disabled={isRotating}
                flex={1}
              >
                {isRotating ? "Starting..." : "Next Round"}
              </Button>
            )}
            
            {/* See All Rounds Button */}
            <Button
              size="$3"
              variant="outlined"
              onPress={handleOpenRoundsModal}
              flex={1}
            >
              See All Rounds
            </Button>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
