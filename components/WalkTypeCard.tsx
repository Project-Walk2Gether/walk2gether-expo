import { COLORS } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text, View, XStack, YStack } from "tamagui";

type WalkType = "friends" | "meetup" | "neighborhood" | null;

interface WalkTypeCardProps {
  type: WalkType;
  title: string;
  description: string;
  icon: IoniconName;
  color: string;
  backgroundColor: string;
  selected: boolean;
  onSelect: (type: WalkType) => void;
}

// Define the icon names we'll use as a type to ensure type safety
type IoniconName =
  | "person-outline"
  | "people-outline"
  | "home-outline"
  | "people";

export default function WalkTypeCard({
  type,
  title,
  description,
  icon,
  color,
  backgroundColor,
  selected,
  onSelect,
}: WalkTypeCardProps) {
  return (
    <Card
      animation="bouncy"
      scale={0.98}
      hoverStyle={{ scale: 1.02 }}
      pressStyle={{ scale: 0.96 }}
      elevate
      size="$4"
      onPress={() => onSelect(type)}
      style={[
        styles.card,
        {
          backgroundColor: selected ? color : backgroundColor,
          borderLeftColor: color,
          borderLeftWidth: 6,
        },
        selected && styles.selectedCard,
      ]}
    >
      <XStack gap="$4" padding="$4" alignItems="center">
        <View
          style={styles.iconContainer}
          backgroundColor={selected ? "white" : color + "30"}
        >
          <Ionicons name={icon} size={28} color={selected ? color : color} />
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
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 0,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
