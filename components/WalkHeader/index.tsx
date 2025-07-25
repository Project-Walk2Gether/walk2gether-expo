import { useAuth } from "@/context/AuthContext";
import { useWalk } from "@/context/WalkContext";
import { useQuery } from "@/utils/firestore";
import { getWalkTitle } from "@/utils/walkType";
import { collection, orderBy, query } from "@react-native-firebase/firestore";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";
import HeaderBackButton from "../HeaderBackButton";
import RoundCountdown from "../Rounds/RoundCountdown";
import WalkMenu from "../WalkMenu";

interface Props {
  goBack: () => void;
}

export default function WalkHeader({ goBack }: Props) {
  const { user } = useAuth();
  const { walk } = useWalk();
  const currentUserId = user?.uid;

  // Get walk title
  const walkTitle = useMemo(() => {
    if (!walk) return "";
    return getWalkTitle(walk, user?.uid);
  }, [walk, user?.uid]);

  // Get activeRound and userPair from context instead of querying directly
  const { activeRound, userPair } = useWalk();
  const insets = useSafeAreaInsets();

  // userPair is now provided by the context

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

  return (
    <Stack
      pt={insets.top}
      px="$2"
      backgroundColor={activeRound && userPair ? userPair.color : "transparent"}
      pressStyle={isTappable ? { opacity: 0.9 } : undefined}
      onPress={isTappable ? navigateToRoundDetail : undefined}
      cursor={isTappable ? "pointer" : undefined}
    >
      {/* Different layouts based on whether there's an active round */}
      {activeRound && userPair ? (
        /* Layout for active round */
        <YStack width="100%" paddingVertical="$2">
          {/* Top row: Back button, emoji and timer, menu */}
          <XStack
            width="100%"
            paddingHorizontal="$2"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Left: Back button */}
            <HeaderBackButton onPress={goBack} color="white" />

            {/* Center: Large emoji with countdown positioned to the right */}
            <Text fontSize={40} lineHeight={44}>
              {userPair.emoji}
            </Text>
            {activeRound.startTime && (
              <XStack position="absolute" right={50} top="8px">
                <RoundCountdown
                  startTime={activeRound.startTime}
                  endTime={activeRound.endTime}
                />
              </XStack>
            )}

            {/* Right: Menu */}
            {walk && (
              <WalkMenu walk={walk} afterDelete={goBack} iconColor="white" />
            )}
          </XStack>

          {/* Bottom row: Partner names and question prompt */}
          <YStack
            width="100%"
            paddingHorizontal="$4"
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
      ) : (
        /* Default layout without active round */
        <XStack
          gap="$3"
          alignItems="center"
          paddingHorizontal="$2"
          paddingVertical="$2"
        >
          {/* Left: Back button */}
          <XStack alignItems="center" flex={1}>
            <HeaderBackButton onPress={goBack} />
          </XStack>

          {/* Center: Title */}
          <YStack alignItems="center" flex={3}>
            <Text fontSize={16} fontWeight="600" textAlign="center">
              {walkTitle}
            </Text>
          </YStack>

          {/* Right: Menu */}
          <XStack justifyContent="flex-end" flex={1}>
            {walk && <WalkMenu walk={walk} afterDelete={goBack} />}
          </XStack>
        </XStack>
      )}
    </Stack>
  );
}
