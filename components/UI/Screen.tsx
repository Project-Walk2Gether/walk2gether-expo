import React from "react";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H1, ScrollView } from "tamagui";
import { BrandGradient, BrandGradientProps } from "./BrandGradient";

interface Props {
  title?: string;
  children: React.ReactNode;
  useTopInsets?: boolean;
  gradientVariant?: BrandGradientProps["variant"];
  titleColor?: string;
  renderAbsolute?: React.ReactNode;
  floatingAction?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const Screen: React.FC<Props> = ({
  title,
  children,
  useTopInsets,
  gradientVariant = "modern",
  titleColor = "black",
  renderAbsolute,
  floatingAction,
  onRefresh,
  refreshing = false,
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
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
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
