import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import WalkingCharacters from "./WalkingCharacters";

interface WalkingSceneProps {
  style?: object;
}

const tree = require("../../assets/animations/tree.lottie");

export default function WalkingScene({ style }: WalkingSceneProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.walkingSection}>
        <View style={styles.ground} />
        <WalkingCharacters style={styles.walkingCharacters} />
      </View>

      <LottieView
        style={styles.treeAnimation}
        source={tree}
        autoPlay
        loop
        speed={0.7}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 120,
    position: "relative",
  },
  treeAnimation: {
    position: "absolute",
    bottom: -60,
    right: -150,
    width: 400,
    height: 400,
    zIndex: -1,
  },
  walkingSection: {
    position: "absolute",
    width: "100%",
    height: 100,
    bottom: 10,
  },
  ground: {
    position: "absolute",
    bottom: -174,
    width: "100%",
    height: 200,
    backgroundColor: "rgba(60, 42, 24, 0.3)",
  },
  walkingCharacters: {
    position: "absolute",
    bottom: -7,
    width: "100%",
  },
});
