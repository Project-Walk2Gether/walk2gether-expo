import { COLORS } from "@/styles/colors";
import { Car, Footprints } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable } from "react-native";
import { Switch, Text, XStack } from "tamagui";

interface Props {
  isDriving: boolean;
  onToggle: (isDriving: boolean) => void;
}

/**
 * Toggle between walking and driving navigation methods
 */
export const NavigationToggle: React.FC<Props> = ({ isDriving, onToggle }) => {
  return (
    <XStack alignItems="center" gap="$2" zIndex={1}>
      {/* Walking section - clickable */}
      <Pressable onPress={() => onToggle(false)}>
        <XStack
          alignItems="center"
          opacity={isDriving ? 0.6 : 1}
          paddingVertical={4}
          paddingHorizontal={4}
        >
          <Footprints size={16} />
          <Text fontSize={12} marginLeft={2}>
            Walking
          </Text>
        </XStack>
      </Pressable>

      {/* Toggle switch with hit slop */}
      <Switch
        size="$1"
        checked={isDriving}
        onCheckedChange={onToggle}
        backgroundColor={isDriving ? "white" : "rgba(100,100,100,0.3)"}
        hitSlop={10}
      >
        <Switch.Thumb
          animation="quick"
          backgroundColor={isDriving ? COLORS.primary : "white"}
        />
      </Switch>

      {/* Driving section - clickable */}
      <Pressable onPress={() => onToggle(true)}>
        <XStack
          alignItems="center"
          opacity={!isDriving ? 0.6 : 1}
          paddingVertical={4}
          paddingHorizontal={4}
        >
          <Text fontSize={12} marginRight={2}>
            Driving
          </Text>
          <Car size={16} />
        </XStack>
      </Pressable>
    </XStack>
  );
};
