import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H1, ScrollView, View, XStack } from "tamagui";
import { BrandGradient } from "./BrandGradient";

interface ScreenProps {
  title: React.ReactNode;
  children: React.ReactNode;
  gradientVariant?: "modern" | "main" | "natural" | "earthy" | "vibrant" | "subtle" | "outdoor";
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  titleColor?: string;
  renderAbsolute?: React.ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({
  title,
  children,
  gradientVariant = "modern",
  leftAction,
  rightAction,
  titleColor = "black",
  renderAbsolute,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <BrandGradient variant={gradientVariant} style={{ flex: 1 }}>
      {renderAbsolute}
      <View f={1} pt={insets.top}>
        <ScrollView
          flex={1}
          width="100%"
          contentContainerStyle={{
            paddingBottom: 40,
            paddingTop: 10,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom="$5"
          >
            {leftAction && <View marginRight="$2">{leftAction}</View>}
            <H1 fontSize={32} fontWeight="bold" flex={1} color={titleColor}>
              {title}
            </H1>
            {rightAction && <View marginLeft="$2">{rightAction}</View>}
          </XStack>
          {children}
        </ScrollView>
      </View>
    </BrandGradient>
  );
};
