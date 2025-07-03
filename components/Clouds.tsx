import LottieView from "lottie-react-native";
import React from "react";
import { View as RNView } from "react-native";
import { View } from "tamagui";
import { isDetox } from "../utils/launchArgs";

interface Props {
  style?: any;
}

export default function Clouds({ style }: Props) {
  // Skip animations in test environment
  if (isDetox) {
    return (
      <View position="relative" width="100%" {...style}>
        <RNView style={{ width: "100%", height: 250 }} />
      </View>
    );
  }
  
  return (
    <View position="relative" width="100%" {...style}>
      <RNView style={{ width: "100%", height: 250 }}>
        <LottieView
          style={{ width: "100%", height: 250 }}
          source={require("../assets/animations/clouds.lottie")}
          autoPlay
          loop
          speed={0.2}
        />
      </RNView>
    </View>
  );
}
