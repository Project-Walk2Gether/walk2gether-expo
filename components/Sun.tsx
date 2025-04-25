import LottieView from "lottie-react-native";
import React from "react";
import { YStack } from "tamagui";

interface Props {
  style?: any;
}

export default function Sun({ style }: Props) {
  return (
    <YStack>
      <LottieView
        style={[{ width: 100, height: 100 }, style]}
        source={require("../assets/animations/sun.lottie")}
        autoPlay
        loop
        speed={1.05}
      />
    </YStack>
  );
}
