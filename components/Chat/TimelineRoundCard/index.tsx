import { useWalk } from "@/context/WalkContext";
import { Edit3 as Edit, MoreVertical } from "@tamagui/lucide-icons";
import React, { useMemo } from "react";
import { Button, Card, Stack, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";
import { useSheet } from "@/context/SheetContext";

import { differenceInMinutes } from "date-fns";
import { MeetupWalk, walkIsMeetupWalk } from "walk2gether-shared";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import { useMenu } from "@/context/MenuContext";
import RoundCountdown from "@/components/Rounds/RoundCountdown";
import { useAuth } from "@/context/AuthContext";

interface Props {
  round: Round | WithId<Round>;
  currentUserId?: string;
  isUpcoming?: boolean;
  isFirstUpcoming?: boolean;
  isActive?: boolean; // New prop for active rounds
}

export default function TimelineRoundCard({ 
  round, 
  currentUserId, 
  isUpcoming = false, 
  isFirstUpcoming = false,
  isActive = false
}: Props) {
  // Get walk context to access participant data
  const { walk } = useWalk();
  const { showSheet, hideSheet } = useSheet();
  const { user } = useAuth();
  const router = useRouter();
  const { showMenu } = useMenu();

  // Check if the current user is the walk owner
  const isWalkOwner = useMemo(() => {
    if (!walk || !user) return false;
    return walk.createdByUid === user.uid;
  }, [walk, user]);

  // Find the current user's pair
  const userPair = React.useMemo(() => {
    if (!currentUserId) return null;
    return round.pairs?.find((pair) => pair.userUids.includes(currentUserId));
  }, [round.pairs, currentUserId]);

  // Get partner names (excluding current user)
  const partnerNames = React.useMemo(() => {
    if (!userPair || !walk?.participantsById) return [];

    // Filter out current user and map to participant names from walk context
    return userPair.userUids
      .filter((uid) => uid !== currentUserId)
      .map((uid) => walk.participantsById[uid]?.displayName);
  }, [userPair, currentUserId, walk?.participantsById]);

  // Helper functions for upcoming rounds

  const startRoundWithDuration = async (durationMinutes: number) => {
    if (!walk || !walkIsMeetupWalk(walk)) return;

    const meetupWalk = walk as MeetupWalk;
    const upcomingRounds = meetupWalk.upcomingRounds || [];
    
    if (upcomingRounds.length === 0) return;

    try {
      // Get the first upcoming round
      const nextRound = upcomingRounds[0];

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
        durationMinutes, // Store the duration for reference
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
      console.error("Error starting round:", error);
    }
  };



  // Show active round with full-width colored background (like WalkRoundControls)
  if (isActive && userPair) {
    // Navigation function for tapping on active round
    const navigateToRoundDetail = () => {
      if (walk?._ref) {
        const walkIdParts = walk._ref.path.split("/");
        const walkId = walkIdParts[walkIdParts.length - 1];
        router.push({
          pathname: "/(app)/(modals)/walk-round",
          params: { walkId },
        });
      }
    };

    return (
      <Stack
        px="$2"
        backgroundColor={userPair.color}
        pressStyle={{ opacity: 0.9 }}
        onPress={navigateToRoundDetail}
        cursor="pointer"
        marginVertical="$1"
      >
        <YStack width="100%" paddingVertical="$2">
          {/* Center: Large emoji with countdown positioned to the left */}
          <XStack
            width="100%"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <Text fontSize={40} lineHeight={44}>
              {userPair.emoji}
            </Text>
            {round.startTime && (
              <XStack position="absolute" left="$2">
                <RoundCountdown
                  startTime={round.startTime}
                  endTime={round.endTime}
                />
              </XStack>
            )}

            {/* Menu button for walk owners */}
            {walk && isWalkOwner && walkIsMeetupWalk(walk) && (
              <XStack position="absolute" right="$2" top="-$2">
                <Button
                  size="$2"
                  circular
                  backgroundColor="rgba(255,255,255,0.2)"
                  borderWidth={0}
                  onPress={() => {
                    showMenu("Round Options", [
                      {
                        label: "See All Rounds",
                        onPress: () => {
                          if (walk?._ref) {
                            const walkIdParts = walk._ref.path.split("/");
                            const walkId = walkIdParts[walkIdParts.length - 1];
                            router.push({
                              pathname: "/(app)/(modals)/walk-rounds-management",
                              params: { walkId },
                            });
                          }
                        },
                      },
                    ]);
                  }}
                >
                  <MoreVertical size={16} color="white" />
                </Button>
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
              {partnerNames.length > 0
                ? partnerNames.join(", ")
                : "your partner"}
            </Text>
            {round.questionPrompt && (
              <Text
                fontSize={13}
                color="white"
                opacity={0.9}
                textAlign="center"
                marginTop="$1"
                textWrap="wrap"
              >
                {round.questionPrompt}
              </Text>
            )}
          </YStack>
        </YStack>
      </Stack>
    );
  }

  // Show different UI for upcoming rounds vs completed rounds
  if (isUpcoming) {
    return (
      <Card
        borderWidth={1}
        borderColor={isFirstUpcoming ? "$blue5" : "$blue3"}
        backgroundColor={isFirstUpcoming ? "$blue2" : "$blue1"}
        borderRadius={8}
        padding="$3"
        marginVertical="$2"
        width="100%"
        position="relative"
      >
        <YStack space="$2">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1} space="$1">
              <XStack alignItems="center" space="$2">
                <Text fontWeight="bold" color="$blue11">
                  Round {round.roundNumber}
                </Text>

                <Text 
                  fontSize="$1" 
                  color={isFirstUpcoming ? "$blue9" : "$blue8"} 
                  fontWeight="bold"
                  backgroundColor={isFirstUpcoming ? "$blue3" : "$blue2"}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  {isFirstUpcoming ? "NEXT" : "UPCOMING"}
                </Text>
              </XStack>
              {round.questionPrompt && (
                <Text
                  fontSize="$3"
                  color="$blue10"
                  fontStyle="italic"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  "{round.questionPrompt}"
                </Text>
              )}
            </YStack>
          </XStack>

          {/* Action buttons for first upcoming round */}
          {isFirstUpcoming && (
            <XStack space="$2" marginTop="$2">
              <Button
                flex={1}
                size="$3"
                theme="blue"
onPress={() => {
                  if (!walk) return;
                  // Use the duration from the round's timing or fallback to walk settings
                  const defaultDuration = walkIsMeetupWalk(walk) 
                    ? (walk as MeetupWalk).minimumNumberOfMinutesWithEachPartner || 15
                    : 15;
                  
                  // If the round has timing info, calculate duration from that
                  if (round.startTime && round.endTime) {
                    const durationMs = round.endTime.toMillis() - round.startTime.toMillis();
                    const durationMinutes = Math.round(durationMs / (1000 * 60));
                    startRoundWithDuration(durationMinutes);
                  } else {
                    startRoundWithDuration(defaultDuration);
                  }
                }}
              >
                Start Round
              </Button>

            </XStack>
          )}


        </YStack>
      </Card>
    );
  }

  // Show condensed version for completed rounds
  if (userPair) {
    return (
      <Card
        pressStyle={{ opacity: 0.8 }}
        borderWidth={1}
        borderColor="$gray5"
        borderRadius={8}
        padding="$2"
        marginVertical="$1"
        width="100%"
      >
        <YStack justifyContent="space-between">
          <XStack mb="$2" gap="$2" alignItems="center" flex={1}>
            <Text
              fontSize={16}
              color={userPair.color}
              backgroundColor={`${userPair.color}20`} // 20% opacity of the color
              borderRadius={4}
              paddingHorizontal="$2"
              paddingVertical="$1"
            >
              {userPair.emoji}
            </Text>
            <XStack gap="$2">
              <Text fontSize={14} fontWeight="500">
                Round {round.roundNumber}
              </Text>
              <Text fontSize={12} color="$gray10" numberOfLines={1}>
                {partnerNames.length > 0
                  ? `Partner: ${partnerNames.join(", ")}`
                  : "No partner"}
              </Text>
            </XStack>
          </XStack>

          {round.questionPrompt && (
            <Text
              fontSize={12}
              color="$blue11"
              flex={1}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {round.questionPrompt}
            </Text>
          )}
        </YStack>
      </Card>
    );
  }

  return null;
}
