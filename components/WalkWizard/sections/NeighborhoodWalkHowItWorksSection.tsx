import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { Bell, Check, Clock, MapPin } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import {
  Card,
  Checkbox,
  Label,
  Spacer,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import WalkIcon from "../../WalkIcon";
import WizardWrapper from "./WizardWrapper";

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
            <Text flex={1} fontSize="$5">
              Start a walk in your neighborhood
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
              <Bell size={16} color="white" />
            </View>
            <Text flex={1} fontSize="$5">
              Choose Walk2Gether neighbors to notify
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
              Notified neighbors have 20 minutes to join
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
              If one or more neighbors decide to join, live locations are shared
              to meet up and walk2gether!
            </Text>
          </XStack>
        </YStack>
      </Card>

      <Spacer flexGrow={1} />
      {userData?.hasCreatedNeighborhoodWalk && (
        <XStack gap="$2" alignItems="center">
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
            Got it! Don't show this again
          </Label>
        </XStack>
      )}
    </WizardWrapper>
  );
}
