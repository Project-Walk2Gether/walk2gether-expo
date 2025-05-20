import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { XStack } from "tamagui";
import Gether from "./Gether";
import Two from "./Two";
import Walk from "./Walk";
import { logoColor } from "./color";

const PULSE_DURATION = 200;
const PULSE_SCALE = 1.3;
const PULSE_DELAY = 100;
const STARTING_DELAY = 2500;

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
const underlineHeight = 4;
const underlineOffset = 20;

export default function AnimatedLogo({ width = 168 }: { width?: number }) {
  const [isAnimating, setIsAnimating] = useState(false);
  // Animated value for underline progress (0 to 1)
  const underlineProgress = useRef(new Animated.Value(0)).current;
  // Animated values for each SVG
  const walkScale = useRef(new Animated.Value(1)).current;
  const twoScale = useRef(new Animated.Value(1)).current;
  const getherScale = useRef(new Animated.Value(1)).current;

  const walkRotate = useRef(new Animated.Value(0)).current;
  const twoRotate = useRef(new Animated.Value(0)).current;
  const getherRotate = useRef(new Animated.Value(0)).current;

  const spinPop = (
    scale: Animated.Value,
    rotate: Animated.Value,
    delay: number
  ) =>
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: PULSE_SCALE,
            duration: PULSE_DURATION,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: PULSE_DURATION,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(rotate, {
            toValue: 1,
            duration: PULSE_DURATION,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: -1,
            duration: PULSE_DURATION,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: PULSE_DURATION,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

  const runAnimation = () => {
    Animated.sequence([
      spinPop(walkScale, walkRotate, 0),
      Animated.delay(PULSE_DELAY),
      spinPop(twoScale, twoRotate, 0),
      Animated.delay(PULSE_DELAY),
      Animated.parallel([
        spinPop(getherScale, getherRotate, 0),
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
    setTimeout(() => {
      setIsAnimating(true);
    }, STARTING_DELAY);

    return () => {
      walkScale.stopAnimation();
      twoScale.stopAnimation();
      getherScale.stopAnimation();
    };
  }, []);

  const underlineWidth = underlineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  const walkWidth = width * walkFraction;
  const twoWidth = width * twoFraction;
  const getherWidth = width * getherFraction;

  const walkSpin = walkRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-20deg", "0deg", "10deg"], // strong left, soft right
  });
  const twoSpin = twoRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["10deg", "0deg", "-15deg"], // reversed direction
  });
  const getherSpin = getherRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-5deg", "0deg", "10deg"], // asymmetrical wobble
  });

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
      <Animated.View
        style={{ transform: [{ scale: walkScale }, { rotate: walkSpin }] }}
      >
        <Walk width={walkWidth} height={height} />
      </Animated.View>
      <Animated.View
        style={{ transform: [{ scale: twoScale }, { rotate: twoSpin }] }}
      >
        <Two width={twoWidth} height={height} />
      </Animated.View>
      <Animated.View
        style={{ transform: [{ scale: getherScale }, { rotate: getherSpin }] }}
      >
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
