import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "tamagui";

/**
 * Standardized screen title component for consistent headers across the app
 */
interface ScreenTitleProps {
  children: React.ReactNode;
  color?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const ScreenTitle: React.FC<ScreenTitleProps> = ({
  children,
  color = "#333333", // Default to dark text
  leftAction,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      {leftAction && (
        <View style={styles.leftActionContainer}>{leftAction}</View>
      )}
      <Text style={styles.title} color={color}>
        {children}
      </Text>
      {rightAction && (
        <View style={styles.rightActionContainer}>{rightAction}</View>
      )}
    </View>
  );
};

/**
 * Shared styles for screen titles
 */
export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
  },
  rightActionContainer: {
    marginLeft: 10,
  },
  leftActionContainer: {
    marginRight: 10,
  },
});
