import { COLORS } from "@/styles/colors";
import { X } from "@tamagui/lucide-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";
import { Button, H4, ScrollView, Text, YStack } from "tamagui";

export default function QuestionPromptsHelpScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Question Prompts Help",
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
              <YStack gap="$2">
                <Text fontSize={16} fontWeight="600">
                  What are Question Prompts?
                </Text>
                <Text fontSize={14} color="$gray10" lineHeight={20}>
                  Question prompts give pairs something interesting to talk
                  about during their round. Each round gets assigned a random
                  question from your list.
                </Text>
              </YStack>

              {/* Example questions */}
              <YStack gap="$3">
                <H4>Example Questions</H4>
                <YStack gap="$1">
                  <Text fontSize={13} color="$gray8">
                    • "What's the most interesting place you've traveled to?"
                  </Text>
                  <Text fontSize={13} color="$gray8">
                    • "If you could have dinner with anyone, who would it be?"
                  </Text>
                  <Text fontSize={13} color="$gray8">
                    • "What's a skill you'd love to learn?"
                  </Text>
                  <Text fontSize={13} color="$gray8">
                    • "What's something you're really passionate about?"
                  </Text>
                  <Text fontSize={13} color="$gray8">
                    • "What's your favorite way to spend a weekend?"
                  </Text>
                </YStack>
              </YStack>

              {/* Tips */}
              <YStack gap="$3">
                <H4>Quick Tips</H4>
                <YStack gap="$1">
                  <Text fontSize={13} color="$gray8">
                    • Keep questions open-ended (avoid yes/no answers)
                  </Text>
                  <Text fontSize={13} color="$gray8">
                    • Add 3-5 questions for variety
                  </Text>
                  <Text fontSize={13} color="$gray8">
                    • Make sure they're appropriate for your group
                  </Text>
                </YStack>
              </YStack>
            </YStack>
          </ScrollView>

          {/* Close Button */}
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
