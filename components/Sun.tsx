import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet } from "react-native";

interface Props {
  style?: object;
}

export default function Sun({ style }: Props) {
  return (
    <LottieView
      style={[styles.animation, style]}
      source={require("../assets/animations/sun.lottie")}
      autoPlay
      loop
      speed={1.05}
    />
  );
}

const styles = StyleSheet.create({
  animation: {
    width: 100,
    height: 100,
  },
});
