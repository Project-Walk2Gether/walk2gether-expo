import React from "react";
import { ActivityIndicator } from "react-native";
import { View, Text } from "tamagui";
import { COLORS } from "@/styles/colors";

interface Props {
  isLoading: boolean;
}

export default function LocationLoading({ isLoading }: Props) {
  if (!isLoading) return null;
  
  return (
    <View
      position="absolute"
      top={80}
      right={15}
      backgroundColor="rgba(255, 255, 255, 0.8)"
      padding={10}
      borderRadius={10}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      shadowColor="#000"
      animation="bouncy"
    >
      <View marginRight={5}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
      <Text fontSize={14} color={COLORS.text}>
        Getting your location...
      </Text>
    </View>
  );
}
