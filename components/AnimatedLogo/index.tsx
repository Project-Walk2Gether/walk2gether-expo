import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { path } from "./path";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  width: number;
  height: number;
}

// Qwitcher Grypen font
// https://danmarshall.github.io/google-font-to-svg-path/
// https://react-svgr.com/playground/?dimensions=false&native=true&typescript=true
export default function AnimatedLogo({ width, height }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const strokeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => setIsAnimating(true), 1000);
  }, []);

  useEffect(() => {
    if (isAnimating) {
      Animated.timing(strokeValue, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setIsAnimating(false);
      }, 2400);
    }
  }, [isAnimating, strokeValue]);

  const strokeWidth = strokeValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 5],
  });
  const strokeDasharray1 = strokeValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 800],
  });

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 549.46 66.382" style={{ width, height }}>
        <AnimatedPath
          fill="rgb(60 42 24)"
          fillRule="evenodd"
          strokeDasharray={[strokeDasharray1, 1000]}
          strokeWidth={strokeWidth}
          stroke="rgb(60 42 24)"
          strokeOpacity={1}
          d={path}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
  },
});
