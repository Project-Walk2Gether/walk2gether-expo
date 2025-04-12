import { COLORS } from "@/styles/colors";
import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { H3, Text, YStack } from "tamagui";

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  action,
}) => {
  return (
    <YStack gap="$3" mb="$6">
      <View style={styles.headerContainer}>
        <YStack>
          <H3 color={COLORS.text} fontWeight="bold">
            {title}
          </H3>
          {subtitle && (
            <Text color={COLORS.textSecondary} fontSize="$3">
              {subtitle}
            </Text>
          )}
        </YStack>
        {action && <View style={styles.actionContainer}>{action}</View>}
      </View>
      <View style={styles.contentContainer}>{children}</View>
    </YStack>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  actionContainer: {
    marginLeft: 8,
  },
  contentContainer: {
    width: "100%",
  },
});

export default Section;
