import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  style?: object;
}

export default function Clouds({ style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <LottieView
        style={styles.animation}
        source={require("../assets/animations/clouds.lottie")}
        autoPlay
        loop
        speed={1.05}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  animation: {
    width: "100%",
    height: 250,
  },
});
