import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H1, ScrollView } from "tamagui";
import { BrandGradient } from "./BrandGradient";

interface Props {
  title?: string;
  children: React.ReactNode;
  useTopInsets?: boolean;
  gradientVariant?:
    | "modern"
    | "main"
    | "natural"
    | "earthy"
    | "vibrant"
    | "subtle"
    | "outdoor";
  titleColor?: string;
  renderAbsolute?: React.ReactNode;
  floatingAction?: React.ReactNode;
}

export const Screen: React.FC<Props> = ({
  title,
  children,
  useTopInsets,
  gradientVariant = "modern",
  titleColor = "black",
  renderAbsolute,
  floatingAction,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <BrandGradient variant={gradientVariant} style={{ flex: 1 }}>
      {renderAbsolute}
      <ScrollView
        flex={1}
        width="100%"
        contentContainerStyle={{
          paddingBottom: floatingAction ? 80 : 40, // Extra padding if FAB is present
          paddingTop: useTopInsets ? insets.top + 10 : undefined,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {title && (
          <H1
            fontSize={32}
            fontWeight="bold"
            marginBottom="$2"
            color={titleColor}
          >
            {title}
          </H1>
        )}
        {children}
      </ScrollView>
      {floatingAction}
    </BrandGradient>
  );
};
