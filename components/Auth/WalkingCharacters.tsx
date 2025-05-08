import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, View as RNView } from "react-native";
import { YStack } from "tamagui";

const { width } = Dimensions.get("window");

interface WalkingCharactersProps {
  style?: any;
}

const TIME_TO_WALK_ACROSS_SCREEN = 11;
const PAUSE_TIME = 6;

// The pencil - walking behind
const CHARACTER_1_SIZE = 320;
const CHARACTER_1_SPEED = 0.8;

// The onion - walking in front
const CHARACTER_2_SIZE = 270;
const CHARACTER_2_SPEED = 0.9;

export default function WalkingCharacters({ style }: WalkingCharactersProps) {
  // Horizontal position animations
  const position = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create a sequence that moves characters across screen then resets position
    const walkAnimation = Animated.sequence([
      // Move across the screen
      Animated.timing(position, {
        toValue: 0,
        duration: PAUSE_TIME * 1000,
        useNativeDriver: true,
      }),
      Animated.timing(position, {
        toValue: 1,
        duration: TIME_TO_WALK_ACROSS_SCREEN * 1000,
        useNativeDriver: true,
      }),
      // Reset instantly (not visible due to being off-screen)
      Animated.timing(position, {
        toValue: -1,
        duration: 0,
        useNativeDriver: true,
      }),
    ]);

    // Create looping animation
    const loopedAnimation = Animated.loop(walkAnimation);

    // Start the animation
    loopedAnimation.start();

    // Clean up animation when component unmounts
    return () => {
      loopedAnimation.stop();
    };
  }, []);

  // Calculate the actual X position based on the animated value
  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, width],
  });

  // We can use tamagui for the container, but need to use React Native's Animated.View for animations
  return (
    <YStack
      position="relative"
      height={300}
      overflow="hidden"
      width="100%"
      zIndex={100}
      {...style}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            flexDirection: "row",
            alignItems: "flex-end",
            transform: [{ translateX }],
          },
        ]}
      >
        {/* First character */}
        <RNView
          style={{
            position: "relative",
            zIndex: 1, // Put first character in front
            left: 30,
            top: -5,
          }}
        >
          <LottieView
            style={{ width: CHARACTER_1_SIZE, height: CHARACTER_1_SIZE }}
            source={require("../../assets/animations/walker1.lottie")}
            autoPlay
            loop
            speed={CHARACTER_1_SPEED}
          />
        </RNView>

        {/* Second character */}
        <RNView
          style={{
            position: "relative",
            zIndex: 2, // Put second character in front
            left: -180, // More overlap
          }}
        >
          <LottieView
            style={{ width: CHARACTER_2_SIZE, height: CHARACTER_2_SIZE }}
            source={require("../../assets/animations/walker2.lottie")}
            autoPlay
            loop
            speed={CHARACTER_2_SPEED}
          />
        </RNView>
      </Animated.View>
    </YStack>
  );
}
