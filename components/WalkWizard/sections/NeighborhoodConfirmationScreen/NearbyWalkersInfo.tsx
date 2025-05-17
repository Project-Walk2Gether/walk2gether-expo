import { COLORS } from "@/styles/colors";
import { Users } from "@tamagui/lucide-icons";
import React from "react";
import { Text, XStack } from "tamagui";

const pluralize = require("pluralize");

interface Props {
  nearbyWalkers: number;
  isLoadingNearbyUsers: boolean;
}

export const NearbyWalkersInfo: React.FC<Props> = ({
  nearbyWalkers,
  isLoadingNearbyUsers,
}) => {
  return (
    <XStack
      backgroundColor={COLORS.action}
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius={10}
      alignItems="center"
      gap="$2"
      width="100%"
    >
      <Users size={18} color="white" />
      <Text fontSize={14} fontWeight="600" color="white" flexShrink={1}>
        {isLoadingNearbyUsers
          ? "Finding walkers..."
          : `${pluralize(
              "Walk2Gether member",
              nearbyWalkers,
              true
            )} in your neighborhood`}
      </Text>
    </XStack>
  );
};

export default NearbyWalkersInfo;
