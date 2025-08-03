import { FriendshipSection } from "@/components/FriendshipSection";
import { ParticipantAdminButtons } from "@/components/ParticipantAdminButtons";
import { useAuth } from "@/context/AuthContext";
import { useWalk } from "@/context/WalkContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { Car, Footprints } from "@tamagui/lucide-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { Avatar, Button, Spinner, Text, View, XStack, YStack } from "tamagui";
import { ParticipantWithRoute, UserData } from "walk2gether-shared";

export default function ParticipantScreen() {
  const params = useLocalSearchParams();
  const walkId = params.walkId as string;
  const participantId = params.participantId as string;
  const { walk } = useWalk();
  const { user } = useAuth();

  // Check if current user is the walk owner
  const isWalkOwner = user?.uid === walk?.createdByUid;

  // Get the participant data
  const { doc: participant, status: participantStatus } =
    useDoc<ParticipantWithRoute>(
      `walks/${walkId}/participants/${participantId}`
    );

  // Get the user data
  const { doc: userData, status: userDataStatus } = useDoc<UserData>(
    `users/${participantId}`
  );

  const isLoading =
    participantStatus === "loading" || userDataStatus === "loading";

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!participant || !userData) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text textAlign="center" color="$red10">
          Participant information not found. They may have been removed or the
          data could not be loaded.
        </Text>
        <Button marginTop="$4" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: userData.name }} />
      <ScrollView style={{ flex: 1 }}>
        <YStack flex={1} padding="$4" gap="$4">
          <YStack alignItems="center" gap="$3">
            <Avatar size="$10" circular>
              {userData.profilePicUrl ? (
                <Avatar.Image src={userData.profilePicUrl} />
              ) : null}
              <Avatar.Fallback backgroundColor={COLORS.primary}>
                <Text color="white" fontWeight="bold">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : "?"}
                </Text>
              </Avatar.Fallback>
            </Avatar>
            <XStack alignItems="center" gap="$2">
              {participant.navigationMethod === "driving" ? (
                <Car size="$1" color={COLORS.text} />
              ) : (
                <Footprints size="$1" color={COLORS.text} />
              )}
              <Text>
                {participant.navigationMethod === "driving"
                  ? "Driving"
                  : "Walking"}
              </Text>
            </XStack>

            {/* Show introduction if available */}
            {participant.introduction && (
              <YStack
                gap="$2"
                backgroundColor="$gray3"
                padding="$3"
                borderRadius="$3"
                width="100%"
                maxWidth={400}
              >
                <Text fontSize="$2" fontWeight="500" color="$gray11">
                  Introduction:
                </Text>
                <Text fontSize="$3" color="$gray12" fontStyle="italic">
                  "{participant.introduction}"
                </Text>
              </YStack>
            )}
          </YStack>

          {/* Only show admin buttons if the current user is the walk owner */}
          {isWalkOwner && (
            <ParticipantAdminButtons
              walkId={walkId}
              participantId={participantId}
              isDenied={!!participant.deniedAt}
            />
          )}

          {/* Show friendship section if the participant is not the current user */}
          {user?.uid !== participantId && (
            <FriendshipSection
              participant={userData}
              participantId={participantId}
            />
          )}
        </YStack>
      </ScrollView>
    </>
  );
}
