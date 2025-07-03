import LottieView from "lottie-react-native";
import React from "react";
import { View } from "tamagui";
import { isDetox } from "../../utils/launchArgs";

const birds = require("./birds2.json");

export default function Birds() {
  // Skip animations in test environment
  if (isDetox) {
    return (
      <View
        style={{
          width: "100%",
        }}
      />
    );
  }
  
  return (
    <LottieView
      speed={0.2}
      style={{
        width: "100%",
        backgroundColor: "blue",
      }}
      source={birds}
      loop
    />
  );
}
