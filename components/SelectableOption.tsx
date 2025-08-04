import { COLORS } from "@/styles/colors";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";

interface Props {
  isSelected: boolean;
  onPress: () => void;
  title: string;
  description: string;
}

export const SelectableOption: React.FC<Props> = ({
  isSelected,
  onPress,
  title,
  description,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? COLORS.action : "white",
        borderColor: isSelected ? COLORS.action : undefined,
        borderWidth: isSelected ? 1 : undefined,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <XStack alignItems="center" gap="$3">
        <View
          width={20}
          height={20}
          borderRadius={10}
          backgroundColor={isSelected ? "white" : "transparent"}
          borderColor={COLORS.action}
          borderWidth={2}
          alignItems="center"
          justifyContent="center"
        >
          {isSelected && (
            <View
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={COLORS.action}
            />
          )}
        </View>
        <YStack flex={1}>
          <Text
            fontSize={16}
            fontWeight="600"
            color={isSelected ? "white" : "black"}
          >
            {title}
          </Text>
          <Text fontSize={14} color={isSelected ? "white" : "gray"}>
            {description}
          </Text>
        </YStack>
      </XStack>
    </TouchableOpacity>
  );
};

export default SelectableOption;
