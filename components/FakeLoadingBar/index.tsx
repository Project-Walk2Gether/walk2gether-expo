import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface Props {
  expectedWaitTime?: number; // in milliseconds
  progress?: number; // optional manual progress value (0-100)
  height?: number;
  showText?: boolean;
  progressText?: string;
  onComplete?: () => void;
}

const FakeLoadingBar: React.FC<Props> = ({
  expectedWaitTime = 5000,
  progress,
  height = 8,
  showText = true,
  progressText = "Loading",
  onComplete,
}) => {
  // Use a single animated value for progress (0-1 scale)
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [displayedProgress, setDisplayedProgress] = useState(0);

  // Listen to animated value changes for display purposes
  useEffect(() => {
    const listener = animatedProgress.addListener(({ value }) => {
      setDisplayedProgress(Math.floor(value * 100));
    });

    return () => {
      animatedProgress.removeListener(listener);
    };
  }, []);

  // Start automatic or manual animation
  useEffect(() => {
    // Handle manual progress if provided
    if (progress !== undefined) {
      Animated.timing(animatedProgress, {
        toValue: progress / 100,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();

      // Trigger completion callback if needed
      if (progress >= 100 && onComplete) {
        setTimeout(onComplete, 500);
      }
    }
    // Automatic mode - animate to 90%
    else {
      // Ensure we start from 0
      animatedProgress.setValue(0);

      // Start animation immediately
      Animated.timing(animatedProgress, {
        toValue: 0.9,
        duration: expectedWaitTime,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }
  }, []);

  return (
    <YStack width="100%">
      <XStack
        width="100%"
        height={height}
        backgroundColor="$gray300"
        borderRadius={height / 2}
        overflow="hidden"
      >
        <Animated.View
          style={{
            height: "100%",
            width: animatedProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: "#22c55e",
            borderRadius: height / 2,
          }}
        />
      </XStack>

      {showText && displayedProgress < 100 && (
        <Text fontSize={12} color="$gray900" textAlign="center" marginTop={4}>
          {`${progressText}... ${displayedProgress}%`}
        </Text>
      )}
    </YStack>
  );
};

export default FakeLoadingBar;
