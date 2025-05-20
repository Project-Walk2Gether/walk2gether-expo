import { ActionButton } from "@/components/ActionButton";
import AuthScenicLayout from "@/components/Auth/AuthScenicLayout";
import { InfoRow } from "@/components/InfoRow";
import { useOnboarding } from "@/context/OnboardingContext";
import { Heart, MapPin, Shield } from "@tamagui/lucide-icons";
import React from "react";
import { H1, Text, YStack } from "tamagui";

export default function HowItWorks() {
  const { goToNextScreen } = useOnboarding();

  return (
    <YStack flex={1}>
      <AuthScenicLayout scroll showSun={true} showTree={true}>
        <YStack gap="$2" pt="$4" pb="$10">
          <H1 fontSize={32} fontWeight="bold" textAlign="center">
            Welcome to Walk2Gether
          </H1>

          <Text fontSize={18} fontWeight="500" textAlign="center" mb="$4">
            What you need to know:
          </Text>

          <YStack gap="$3" width="100%" px="$4">
            <InfoRow
              icon={<Heart size={24} />}
              title="Nonprofit Mission"
              content="This app is developed by a nonprofit foundation to foster connection through walking together"
            />
            <InfoRow
              icon={<MapPin size={24} />}
              title="Location Sharing"
              content="Only used to facilitate walks and track miles walked together"
            />
            <InfoRow
              icon={<Shield size={24} />}
              title="Data Privacy"
              content="Your information is never sold or shared"
            />
          </YStack>
          <YStack mx="$4" alignItems="center" mt="$6">
            <ActionButton onPress={goToNextScreen} label="Let's Walk2Gether!" />
          </YStack>
        </YStack>
      </AuthScenicLayout>
    </YStack>
  );
}
