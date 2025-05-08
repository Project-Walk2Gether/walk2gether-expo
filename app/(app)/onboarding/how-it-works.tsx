import AuthScenicLayout from "@/components/Auth/AuthScenicLayout";
import { COLORS } from "@/styles/colors";
import { Bell, Heart, MapPin, Shield, Users } from "@tamagui/lucide-icons";
import React from "react";
import { Button, H1, Text, XStack, YStack } from "tamagui";
import { useOnboarding } from "./_layout";

export default function HowItWorks() {
  const { goToNextScreen, skipOnboarding } = useOnboarding();

  return (
    <YStack flex={1}>
      <Button
        position="absolute"
        top={50}
        right={20}
        zIndex={10}
        variant="outlined"
        borderColor="white"
        color="white"
        onPress={skipOnboarding}
      >
        Skip
      </Button>
      <AuthScenicLayout scroll showSun={true} showTree={true} showHouse={false}>
        <YStack gap="$6" pt="$10" pb="$10">
          <H1 fontSize={32} fontWeight="bold" textAlign="center" color="white">
            Welcome to Walk2Gether
          </H1>

          <Text
            fontSize={18}
            fontWeight="500"
            textAlign="center"
            color="white"
            mt="$2"
            mb="$4"
          >
            What you need to know:
          </Text>

          <YStack gap="$5" width="100%" px="$3">
            {/* Nonprofit Mission */}
            <XStack
              backgroundColor="rgba(255, 255, 255, 0.15)"
              p="$4"
              borderRadius={12}
              gap="$3"
              alignItems="center"
            >
              <Heart size={24} color="white" />
              <YStack flex={1}>
                <Text fontWeight="600" color="white" fontSize={16}>
                  Nonprofit Mission
                </Text>
                <Text color="white" fontSize={14} opacity={0.9}>
                  Reconnect people through 1:1 walking
                </Text>
              </YStack>
            </XStack>

            {/* Location Sharing */}
            <XStack
              backgroundColor="rgba(255, 255, 255, 0.15)"
              p="$4"
              borderRadius={12}
              gap="$3"
              alignItems="center"
            >
              <MapPin size={24} color="white" />
              <YStack flex={1}>
                <Text fontWeight="600" color="white" fontSize={16}>
                  Location Sharing
                </Text>
                <Text color="white" fontSize={14} opacity={0.9}>
                  Only used to enhance your walking experience
                </Text>
              </YStack>
            </XStack>

            {/* Data Privacy */}
            <XStack
              backgroundColor="rgba(255, 255, 255, 0.15)"
              p="$4"
              borderRadius={12}
              gap="$3"
              alignItems="center"
            >
              <Shield size={24} color="white" />
              <YStack flex={1}>
                <Text fontWeight="600" color="white" fontSize={16}>
                  Data Privacy
                </Text>
                <Text color="white" fontSize={14} opacity={0.9}>
                  Your information is never sold or shared
                </Text>
              </YStack>
            </XStack>

            {/* Recommendations */}
            <XStack
              backgroundColor="rgba(255, 255, 255, 0.15)"
              p="$4"
              borderRadius={12}
              gap="$3"
              alignItems="center"
            >
              <Users size={24} color="white" />
              <YStack flex={1}>
                <Text fontWeight="600" color="white" fontSize={16}>
                  Recommendations
                </Text>
                <Text color="white" fontSize={14} opacity={0.9}>
                  Smart matching of walkers
                </Text>
              </YStack>
            </XStack>

            {/* Notifications */}
            <XStack
              backgroundColor="rgba(255, 255, 255, 0.15)"
              p="$4"
              borderRadius={12}
              gap="$3"
              alignItems="center"
            >
              <Bell size={24} color="white" />
              <YStack flex={1}>
                <Text fontWeight="600" color="white" fontSize={16}>
                  Notifications
                </Text>
                <Text color="white" fontSize={14} opacity={0.9}>
                  Stay informed about nearby walks
                </Text>
              </YStack>
            </XStack>
          </YStack>

          <YStack alignItems="center" mt="$6">
            <Text fontSize={20} fontWeight="bold" color="white" mb="$4">
              Let's Walk2Gether!
            </Text>

            <Button
              onPress={goToNextScreen}
              backgroundColor={COLORS.action}
              paddingHorizontal={40}
              paddingVertical={14}
              borderRadius={30}
              marginTop={20}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text fontSize={16} fontWeight="600" color="white">
                Continue
              </Text>
            </Button>
          </YStack>
        </YStack>
      </AuthScenicLayout>
    </YStack>
  );
}
