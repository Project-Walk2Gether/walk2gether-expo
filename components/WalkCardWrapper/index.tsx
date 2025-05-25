import { COLORS } from "@/styles/colors";
import React from "react";
import { Card, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";

type WalkType = Walk["type"];
type KnownWalkType = keyof typeof COLORS.walkTypes;

export interface WalkCardWrapperProps {
  type?: WalkType;
  color?: string;
  backgroundColor?: string;
  selected?: boolean;
  elevation?: number;
  onPress?: () => void;
  children: React.ReactNode;
  paddingVertical?: number | string;
  paddingHorizontal?: number | string;
  animation?: boolean;
}

export const WalkCardWrapper: React.FC<WalkCardWrapperProps> = ({
  type,
  color,
  backgroundColor,
  selected = false,
  elevation = 4,
  onPress,
  children,
  paddingVertical = "$3",
  paddingHorizontal = "$4",
  animation = true,
}) => {
  // Check if the walk type is one we have defined colors for
  const isKnownType = type && Object.keys(COLORS.walkTypes).includes(type);
  const safeType = isKnownType ? (type as KnownWalkType) : undefined;
  
  // Determine colors based on walk type if provided
  const cardColor = color || 
    (safeType ? COLORS.walkTypes[safeType].main : COLORS.primary);
    
  const cardBgColor = backgroundColor || 
    (selected && safeType ? COLORS.walkTypes[safeType].main : 
     safeType ? COLORS.walkTypes[safeType].background : COLORS.card);

  return (
    <Card
      animation={animation ? "bouncy" : undefined}
      scale={animation ? 0.98 : undefined}
      hoverStyle={animation ? { scale: 1.02 } : undefined}
      pressStyle={animation ? { scale: 0.96 } : undefined}
      elevate={elevation > 0}
      size="$4"
      onPress={onPress}
      backgroundColor={cardBgColor}
      borderRadius={16}
      borderWidth={0}
      borderLeftColor={cardColor}
      borderLeftWidth={6}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={selected ? 0.15 : 0.1}
      shadowRadius={selected ? 6 : 4}
      elevation={selected ? elevation + 2 : elevation}
      overflow="hidden"
    >
      <YStack
        pb={paddingVertical}
        px={paddingHorizontal}
        pt={paddingVertical}
      >
        {children}
      </YStack>
    </Card>
  );
};

export default WalkCardWrapper;
