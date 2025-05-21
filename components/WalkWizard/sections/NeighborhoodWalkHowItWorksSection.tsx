import { COLORS } from "@/styles/colors";
import { useUserData } from "@/context/UserDataContext";
import { Bell, Check, Clock, MapPin } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Card, Checkbox, Label, Text, View, XStack, YStack } from "tamagui";
import WizardWrapper from "./WizardWrapper";
import WalkIcon from "../../WalkIcon";

interface Props {
  onContinue: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function NeighborhoodWalkHowItWorksSection({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}: Props) {
  const { userData, updateUserData } = useUserData();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    setDontShowAgain(checked);
  };

  const handleContinue = async () => {
    // If checkbox is checked, update the user data
    if (dontShowAgain) {
      await updateUserData({ neighborhoodWalksHowItWorksDontShowAgain: true });
    }
    onContinue();
  };
  return (
    <WizardWrapper
      onContinue={handleContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      continueText="Continue"
    >
      <Card
        backgroundColor="white"
        borderRadius={12}
        padding="$4"
        marginBottom="$2"
      >
        <YStack gap="$4">
          <XStack gap="$3" alignItems="center">
            <View
              backgroundColor={COLORS.action}
              width={32}
              height={32}
              borderRadius={16}
              alignItems="center"
              justifyContent="center"
            >
              <MapPin size={16} color="white" />
            </View>
            <Text flex={1} fontSize="$5">Start a walk in your neighborhood</Text>
          </XStack>

          <XStack gap="$3" alignItems="center">
            <View
              backgroundColor={COLORS.action}
              width={32}
              height={32}
              borderRadius={16}
              alignItems="center"
              justifyContent="center"
            >
              <Bell size={16} color="white" />
            </View>
            <Text flex={1} fontSize="$5">
              Choose if you would like to notify nearby Walk2Gether neighbors
            </Text>
          </XStack>

          <XStack gap="$3" alignItems="center">
            <View
              backgroundColor={COLORS.action}
              width={32}
              height={32}
              borderRadius={16}
              alignItems="center"
              justifyContent="center"
            >
              <Clock size={16} color="white" />
            </View>
            <Text flex={1} fontSize="$5">
              Neighbors have 20 minutes to request to join your walk
            </Text>
          </XStack>

          <XStack gap="$3" alignItems="center">
            <View
              backgroundColor={COLORS.action}
              width={32}
              height={32}
              borderRadius={16}
              alignItems="center"
              justifyContent="center"
            >
              <WalkIcon size={16} color="white" />
            </View>
            <Text flex={1} fontSize="$5">
              If you accept, you'll share live locations to meet up and
              walk2gether!
            </Text>
          </XStack>

          {/* Don't show this again checkbox */}
          <XStack gap="$2" alignItems="center" marginTop="$4">
            <Checkbox
              id="dontShowAgain"
              size="$4"
              checked={dontShowAgain}
              onCheckedChange={handleCheckboxChange}
              backgroundColor={dontShowAgain ? COLORS.action : undefined}
            >
              <Checkbox.Indicator>
                <Check size={16} color="white" />
              </Checkbox.Indicator>
            </Checkbox>
            <Label htmlFor="dontShowAgain" size="$4" color="$gray11">
              Don't show this again
            </Label>
          </XStack>
        </YStack>
      </Card>
    </WizardWrapper>
  );
}
