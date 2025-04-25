import React, { useEffect, useRef, useState } from "react";
import { Animated, View as RNView } from "react-native";
import Svg, { Path } from "react-native-svg";
import { View } from "tamagui";
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
  /* animated value 0-1 that drives the write-on */
  const progress = useRef(new Animated.Value(0)).current;
  const [readyToMeasure, setReadyToMeasure] = useState(false);

  /* length of the outline once we’ve queried it */
  const [length, setLength] = useState<number | null>(null);

  /* ref so we can call getTotalLength() */
  const pathRef = useRef<Path>(null);

  useEffect(() => {
    if (pathRef.current) {
      const l = pathRef.current.getTotalLength?.() ?? 0;
      setLength(l); // e.g. ≈1650 for this logo
      setTimeout(() => setIsAnimating(true), 0);
    }
  }, [readyToMeasure]);

  useEffect(() => {
    if (length && isAnimating) {
      console.log("STARTING");
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    }
  }, [isAnimating, length]);

  const dashOffset = length
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [length / 2, length],
      })
    : 0;

  const strokeWidth = progress.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [2, 2, 4],
  });

  const strokeDasharray = length
    ? [
        progress.interpolate({ inputRange: [0, 1], outputRange: [0, length] }), // dash grows
        progress.interpolate({ inputRange: [0, 1], outputRange: [length, 0] }), // gap shrinks
      ]
    : undefined;

  function handlePathLayout() {
    if (pathRef.current) {
      setReadyToMeasure(true);
    }
  }

  return (
    <View 
      position="relative"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height={60}
    >
      <Svg viewBox="0 0 549.46 66.382" style={{ width, height }}>
        <AnimatedPath
          ref={pathRef}
          fill="rgb(60 42 24)"
          fillRule="evenodd"
          onLayout={handlePathLayout}
          strokeLinejoin="round"
          strokeDashoffset={dashOffset}
          strokeDasharray={strokeDasharray}
          strokeWidth={strokeWidth}
          stroke="rgb(60 42 24)"
          strokeOpacity={1}
          d={path}
        />
      </Svg>
    </View>
  );
}
