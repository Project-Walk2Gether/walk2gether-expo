import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { XStack } from "tamagui";
import Gether from "./Gether";
import Two from "./Two";
import Walk from "./Walk";
import { logoColor } from "./color";

const PULSE_DURATION = 300;
const PULSE_SCALE = 1.13;
const PULSE_DELAY = 180;
const STARTING_DELAY = 1500;

// Use actual viewBox widths for each SVG
const walkViewBoxWidth = 218.4;
const twoViewBoxWidth = 41.467;
const getherViewBoxWidth = 309.527;
const totalViewBoxWidth =
  walkViewBoxWidth + twoViewBoxWidth + getherViewBoxWidth;

const walkFraction = walkViewBoxWidth / totalViewBoxWidth;
const twoFraction = twoViewBoxWidth / totalViewBoxWidth;
const getherFraction = getherViewBoxWidth / totalViewBoxWidth;

// Use the new max viewBox height for consistent alignment
const height = 44;

// Underline thickness and offset
const underlineHeight = 2;
const underlineOffset = 20;

export default function AnimatedLogo({ width = 168 }: { width?: number }) {
  const [isAnimating, setIsAnimating] = useState(false);
  // Animated value for underline progress (0 to 1)
  const underlineProgress = useRef(new Animated.Value(0)).current;
  // Animated values for each SVG
  const walkScale = useRef(new Animated.Value(1)).current;
  const twoScale = useRef(new Animated.Value(1)).current;
  const getherScale = useRef(new Animated.Value(1)).current;

  // Helper to animate scale up and down
  const pulse = (animatedValue: Animated.Value, delay: number) =>
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: PULSE_SCALE,
        duration: PULSE_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: PULSE_DURATION,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

  // Play the pulse animation sequence once
  // Animation runner, called from useEffect
  const runAnimation = () => {
    underlineProgress.setValue(0); // Reset before starting
    Animated.sequence([
      Animated.delay(STARTING_DELAY),
      pulse(walkScale, 0),
      Animated.delay(PULSE_DELAY),
      pulse(twoScale, 0),
      Animated.delay(PULSE_DELAY),
      Animated.parallel([
        pulse(getherScale, 0),
        Animated.timing(underlineProgress, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
    ]).start(() => {
      setIsAnimating(false);
    });
  };

  useEffect(() => {
    if (isAnimating) {
      runAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating]);

  // On mount, trigger the animation once
  useEffect(() => {
    setIsAnimating(true);
    return () => {
      walkScale.stopAnimation();
      twoScale.stopAnimation();
      getherScale.stopAnimation();
    };
  }, [walkScale, twoScale, getherScale]);

  const underlineWidth = underlineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  const walkWidth = width * walkFraction;
  const twoWidth = width * twoFraction;
  const getherWidth = width * getherFraction;

  return (
    <XStack
      alignItems="center"
      space={0}
      width={width}
      height={height + underlineHeight + underlineOffset}
      onPress={() => {
        if (!isAnimating) setIsAnimating(true);
      }}
      position="relative"
    >
      <Animated.View style={{ transform: [{ scale: walkScale }] }}>
        <Walk width={walkWidth} height={height} />
      </Animated.View>
      <Animated.View style={{ transform: [{ scale: twoScale }] }}>
        <Two width={twoWidth} height={height} />
      </Animated.View>
      <Animated.View style={{ transform: [{ scale: getherScale }] }}>
        <Gether width={getherWidth} height={height} />
      </Animated.View>
      {/* Animated Underline */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          top: height + underlineOffset,
          height: underlineHeight,
          width: underlineWidth,
          backgroundColor: logoColor,
          borderRadius: underlineHeight / 2,
        }}
      />
    </XStack>
  );
}
