import { COLORS } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";
import WalkCardWrapper from "./WalkCardWrapper";

type WalkType = Walk["type"];
type KnownWalkType = keyof typeof COLORS.walkTypes;

interface Props {
  type: WalkType;
  title: string;
  description: string;
  icon: IoniconName;
  color?: string;
  backgroundColor?: string;
  selected: boolean;
  onSelect: (type: WalkType) => void;
}

// Define the icon names we'll use as a type to ensure type safety
type IoniconName =
  | "person-outline"
  | "people-outline"
  | "home-outline"
  | "people";

// Helper function to safely get the color for a walk type
function getTypeColor(type: WalkType, fallbackColor?: string): string {
  if (!type) return fallbackColor || COLORS.primary;
  
  // Check if the walk type is one we have defined colors for
  const isKnownType = Object.keys(COLORS.walkTypes).includes(type);
  if (isKnownType) {
    return fallbackColor || COLORS.walkTypes[type as KnownWalkType].main;
  }
  return fallbackColor || COLORS.primary;
}

export default function WalkTypeCard({
  type,
  title,
  description,
  icon,
  color,
  backgroundColor,
  selected,
  onSelect,
}: Props) {
  return (
    <WalkCardWrapper
      type={type}
      color={color}
      backgroundColor={backgroundColor}
      selected={selected}
      onPress={() => onSelect(type)}
      paddingVertical="$3"
      paddingHorizontal="$3"
    >
      <XStack gap="$3" alignItems="center">
        <View
          width={50}
          height={50}
          borderRadius={12}
          justifyContent="center"
          alignItems="center"
          backgroundColor={selected ? "white" : getTypeColor(type, color) + "30"}
        >
          <Ionicons 
            name={icon} 
            size={28} 
            color={getTypeColor(type, color)} 
          />
        </View>

        <YStack flexShrink={1}>
          <Text
            fontSize="$5"
            fontWeight="bold"
            color={selected ? "white" : COLORS.text}
            marginTop="$2"
          >
            {title}
          </Text>

          <Text
            fontSize="$5"
            color={selected ? "rgba(255,255,255,0.9)" : COLORS.text}
            marginTop="$1"
          >
            {description}
          </Text>
        </YStack>
      </XStack>
    </WalkCardWrapper>
  );
}
