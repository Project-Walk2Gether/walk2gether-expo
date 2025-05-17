import { COLORS } from "@/styles/colors";
import { Handshake, Pin, Speech } from "@tamagui/lucide-icons";
import React from "react";
import { Card, H4, Text, View, XStack, YStack } from "tamagui";

interface Props {}

export const NeighborhoodWalkHowItWorksSection: React.FC<Props> = () => {
  return (
    <Card
      backgroundColor="white"
      borderRadius={12}
      padding="$4"
      marginBottom="$2"
    >
      <H4 textAlign="center" marginBottom="$2">
        How it works
      </H4>

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
            <Pin size={16} color="white" />
          </View>
          <Text flex={1}>
            Walk2Gether will notify all members within your neighborhood
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
            <Speech size={16} color="white" />
          </View>
          <Text flex={1}>
            Members who join can chat with you to coordinate meetup details
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
            <Handshake size={16} color="white" />
          </View>
          <Text flex={1}>
            Meet your neighbors, make connections, and stay healthy together!
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
};

export default NeighborhoodWalkHowItWorksSection;
