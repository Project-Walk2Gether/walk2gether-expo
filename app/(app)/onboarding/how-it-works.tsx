import { ActionButton } from "@/components/ActionButton";
import AuthScenicLayout from "@/components/Auth/AuthScenicLayout";
import { Heart, MapPin, Shield } from "@tamagui/lucide-icons";
import React from "react";
import { H1, Text, XStack, YStack } from "tamagui";
import { useOnboarding } from "./_layout";

export default function HowItWorks() {
  const { goToNextScreen } = useOnboarding();

  return (
    <YStack flex={1}>
      <AuthScenicLayout scroll showSun={true} showTree={true}>
        <YStack gap="$3" pt="$10" pb="$10">
          <H1 fontSize={32} fontWeight="bold" textAlign="center">
            Welcome to Walk2Gether
          </H1>

          <Text
            fontSize={18}
            fontWeight="500"
            textAlign="center"
            mt="$2"
            mb="$4"
          >
            What you need to know:
          </Text>

          <YStack gap="$5" width="100%" px="$3">
            {/* Nonprofit Mission */}
            <XStack
              backgroundColor="white"
              p="$4"
              borderRadius={12}
              gap="$3"
              alignItems="center"
            >
              <Heart size={24} />
              <YStack flex={1}>
                <Text fontWeight="bold" fontSize={16} mb="$1">
                  Nonprofit Mission
                </Text>
                <Text fontSize={14} opacity={0.9}>
                  Reconnect people through 1:1 walking
                </Text>
              </YStack>
            </XStack>

            {/* Location Sharing */}
            <XStack
              backgroundColor="white"
              p="$4"
              borderRadius={12}
              gap="$3"
              alignItems="center"
            >
              <MapPin size={24} />
              <YStack flex={1}>
                <Text fontWeight="bold" fontSize={16} mb="$1">
                  Location Sharing
                </Text>
                <Text fontSize={14} opacity={0.9}>
                  Only used to enhance your walking experience
                </Text>
              </YStack>
            </XStack>

            {/* Data Privacy */}
            <XStack
              backgroundColor="white"
              p="$4"
              borderRadius={12}
              gap="$3"
              alignItems="center"
            >
              <Shield size={24} />
              <YStack flex={1}>
                <Text fontWeight="bold" fontSize={16} mb="$1">
                  Data Privacy
                </Text>
                <Text fontSize={14} opacity={0.9}>
                  Your information is never sold or shared
                </Text>
              </YStack>
            </XStack>
          </YStack>

          <YStack mx="$4" alignItems="center" mt="$6">
            <ActionButton onPress={goToNextScreen} label="Let's Walk2Gether!" />
          </YStack>
        </YStack>
      </AuthScenicLayout>
    </YStack>
  );
}
