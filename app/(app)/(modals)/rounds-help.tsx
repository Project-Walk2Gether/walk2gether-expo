import { COLORS } from "@/styles/colors";
import { Clock, Heart, Shuffle, Users, X } from "@tamagui/lucide-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";
import { Button, H4, ScrollView, Text, XStack, YStack } from "tamagui";

export default function RoundsHelpScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "How Rounds Work",
          headerRight: () => (
            <Button
              size="$3"
              circular
              icon={<X size={20} />}
              transparent
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <YStack flex={1} padding="$4">
          {/* Content */}
          <ScrollView flex={1}>
            <YStack gap="$4" paddingVertical="$2">
              {/* Overview */}
              <YStack gap="$2" marginBottom="$4">
                <Text fontSize={16} fontWeight="600">
                  What are Rounds?
                </Text>
                <Text fontSize={14} color="$gray10" lineHeight={20}>
                  Rounds help organize your meetup walk so everyone gets to
                  connect with different people. The walk is automatically split
                  into timed rounds where participants are paired up to walk and
                  chat together.
                </Text>
              </YStack>

              {/* How it works */}
              <YStack gap="$3">
                <H4>How It Works</H4>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$3">
                    <Clock size={20} color={COLORS.primary} />
                    <YStack flex={1}>
                      <Text fontWeight="600">Timed Rounds</Text>
                      <Text fontSize={13} color="$gray10">
                        Each round lasts for the "minimum minutes with each
                        partner" you set (default: 5 minutes). This ensures
                        everyone gets quality time together.
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$3">
                    <Users size={20} color={COLORS.primary} />
                    <YStack flex={1}>
                      <Text fontWeight="600">Automatic Pairing</Text>
                      <Text fontSize={13} color="$gray10">
                        Participants are automatically paired into groups of 2.
                        The system ensures everyone gets to walk with everyone
                        else, as long as there's enough time.
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$3">
                    <Heart size={20} color={COLORS.primary} />
                    <YStack flex={1}>
                      <Text fontWeight="600">Emoji & Color Coding</Text>
                      <Text fontSize={13} color="$gray10">
                        Each pair gets assigned a unique emoji and color for
                        their round. This makes it easy to find your partner in
                        the group!
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$3">
                    <Shuffle size={20} color={COLORS.primary} />
                    <YStack flex={1}>
                      <Text fontWeight="600">Rotating Partners</Text>
                      <Text fontSize={13} color="$gray10">
                        After each round, partners rotate so you get to meet and
                        chat with different people throughout the walk.
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </YStack>
            </YStack>
          </ScrollView>
          <Button
            backgroundColor={COLORS.primary}
            color="white"
            onPress={() => router.back()}
            marginTop="$4"
          >
            Got it!
          </Button>
        </YStack>
      </SafeAreaView>
    </>
  );
}
