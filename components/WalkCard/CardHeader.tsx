import { House } from "@tamagui/lucide-icons";
import React, { ReactNode } from "react";
import { Text, XStack, YStack } from "tamagui";
import WalkIcon from "../WalkIcon";

interface Props {
  /**
   * The icon or avatar component to display
   */
  icon: React.ReactElement;

  /**
   * Title text to display
   */
  title: string;

  /**
   * Optional action component (like a menu)
   */
  action?: ReactNode;

  /**
   * Type of walk: "Friends", "Neighborhood", or "Meetup"
   */
  walkType: "Friends" | "Neighborhood" | "Meetup";

  /**
   * Whether the current user is the initiator of the walk
   */
  isUserInitiator: boolean;

  /**
   * Name of the person who initiated the walk
   */
  initiatorName: string;
}

/**
 * A specialized header component for cards that displays an icon/avatar, title, and optional action
 */
export const CardHeader: React.FC<Props> = ({
  icon,
  action,
  walkType,
  isUserInitiator,
  initiatorName,
}) => {
  // Determine which icon to show based on walkType
  const walkTypeIcon = 
    walkType === "Friends" ? (
      <WalkIcon size={24} color="#000" />
    ) : walkType === "Neighborhood" ? (
      <House size={24} color="#000" />
    ) : (
      // Meetup icon - using chat bubbles icon from Tamagui
      <Text fontSize={24} color="#000">💬</Text>
    );

  return (
    <YStack mx={-4} mb={3}>
      {/* Main Header with Walk Type and Menu/Avatar */}
      <XStack justifyContent="space-between" alignItems="center" mb="$2">
        <XStack flex={1} gap="$2" alignItems="center">
          {walkTypeIcon}
          <Text
            fontSize={20}
            fontWeight="700"
            color="$gray12"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isUserInitiator ? "My" : `${initiatorName}'s`} {walkType} Walk
          </Text>
        </XStack>

        {/* Right side: menu for user's walks, avatar for others' walks */}
        {isUserInitiator ? action : icon}
      </XStack>
    </YStack>
  );
};
