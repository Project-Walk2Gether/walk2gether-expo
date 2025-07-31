import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { useWalk } from "@/context/WalkContext";
import { MoreVertical } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Button, Stack, Text, XStack, YStack } from "tamagui";
import { MeetupWalk, walkIsMeetupWalk } from "walk2gether-shared";
import RoundCountdown from "../Rounds/RoundCountdown";

interface Props {}

export default function WalkRoundControls({}: Props) {
  const { user } = useAuth();
  const { walk } = useWalk();
  const { showMenu } = useMenu();
  const currentUserId = user?.uid;

  // Check if the current user is the walk owner
  const isWalkOwner = useMemo(() => {
    if (!walk || !user) return false;
    return walk.createdByUid === user.uid;
  }, [walk, user]);

  // Check if the walk is a MeetupWalk and get upcoming rounds
  const isMeetupWalk = walk ? walkIsMeetupWalk(walk) : false;
  const upcomingRounds =
    isMeetupWalk && walk
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



  // Handle opening the rounds management modal
  const handleOpenRoundsModal = () => {
    if (walk?._ref) {
      const walkIdParts = walk._ref.path.split("/");
      const walkId = walkIdParts[walkIdParts.length - 1];
      router.push({
        pathname: "/(app)/(modals)/walk-rounds-management",
        params: { walkId },
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
                <XStack position="absolute" left="$2">
                  <RoundCountdown
                    startTime={activeRound.startTime}
                    endTime={activeRound.endTime}
                  />
                </XStack>
              )}

              {/* Menu button for walk owners */}
              {isWalkOwner && isMeetupWalk && (
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
                          onPress: handleOpenRoundsModal,
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


    </YStack>
  );
}
