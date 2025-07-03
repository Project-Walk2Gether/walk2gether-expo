import LottieView from "lottie-react-native";
import React from "react";
import { YStack } from "tamagui";
import { isDetox } from "../utils/launchArgs";

interface Props {
  style?: any;
}

export default function Sun({ style }: Props) {
  // Skip animations in test environment
  if (isDetox) {
    return <YStack style={[{ width: 100, height: 100 }, style]} />;
  }
  
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
