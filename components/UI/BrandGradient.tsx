import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

// Colors extracted from the Walk2Gether logo
export const BRAND_COLORS = {
  // Brown/beige colors from logo
  brownDark: "#372923", // Dark brown from figure
  brownLight: "#C0A78E", // Light beige/tan from background

  // More subtle beige/brown variants
  beigeLight: "#E8DFD0", // Very light beige
  beigeMedium: "#D4C5AE", // Medium beige
  beigeDark: "#B8A99A", // Darker beige

  // Green colors from logo
  greenDark: "#1B6356", // Dark green from figure
  greenLight: "#5DB176", // Light green from figure

  // More subtle green variants
  greenSoft: "#A7C4B5", // Soft green
  greenPale: "#C4D8CF", // Pale green
  greenMuted: "#8AB0A0", // Muted green

  // Sky blue colors for outdoor scenes
  skyBlueLight: "#B8E0FF", // Light sky blue
  skyBlueMedium: "#88C4F2", // Medium sky blue
  skyBlueDark: "#5A9BD5", // Darker sky blue
  skyBlueDeep: "#3E78B3", // Deep sky blue

  // Current gradient colors (can be used as an alternative)
  tealBlue: "#4EB1BA",
  tealGreen: "#6EDAA8",
  lightGreen: "#8BEBA0",
};

// Predefined gradient combinations
export const GRADIENTS = {
  // Main gradient based on current implementation
  main: [
    BRAND_COLORS.tealBlue,
    BRAND_COLORS.tealGreen,
    BRAND_COLORS.lightGreen,
  ],

  // New natural gradient based on the logo colors
  natural: [BRAND_COLORS.brownLight, BRAND_COLORS.greenLight],

  // Earthy gradient
  earthy: [
    BRAND_COLORS.brownDark,
    BRAND_COLORS.brownLight,
    BRAND_COLORS.greenLight,
  ],

  // Vibrant green
  vibrant: [
    BRAND_COLORS.greenDark,
    BRAND_COLORS.greenLight,
    BRAND_COLORS.lightGreen,
  ],

  // Subtle modern gradient (light beige to soft green)
  subtle: [BRAND_COLORS.beigeLight, BRAND_COLORS.greenPale],

  // Modern natural gradient (light on top, darker at bottom)
  modern: [
    BRAND_COLORS.beigeLight,
    BRAND_COLORS.beigeMedium,
    BRAND_COLORS.greenMuted,
  ],

  // Outdoor sky gradient (top to bottom)
  outdoor: [
    BRAND_COLORS.skyBlueLight, // Light sky at the top
    BRAND_COLORS.skyBlueMedium,
    BRAND_COLORS.skyBlueDeep, // Deeper blue toward the bottom
  ],
};

export interface BrandGradientProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: [string, string, ...string[]];
  variant?: keyof typeof GRADIENTS;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

/**
 * A reusable brand gradient component that applies the Walk2Gether branded
 * gradient colors.
 */
export const BrandGradient: React.FC<BrandGradientProps> = ({
  children,
  style,
  colors,
  variant = "outdoor",
  start = { x: 0, y: 1 },
  end = { x: 0, y: 0 },
  ...rest
}) => {
  // Use explicitly provided colors, or fall back to a predefined gradient
  const gradientColors =
    colors || (GRADIENTS[variant] as [string, string, ...string[]]);

  return (
    <LinearGradient
      colors={gradientColors}
      style={style}
      start={start}
      end={end}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
};

export default BrandGradient;
