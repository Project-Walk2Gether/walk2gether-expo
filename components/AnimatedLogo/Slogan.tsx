import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Text } from "tamagui";

export function Slogan({ delay = 2500 }: { delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, opacity]);
  return (
    <Animated.View style={{ opacity }}>
      <Text
        fontSize="$4"
        fontWeight="bold"
        textAlign="center"
        color="rgb(60 42 24)"
        opacity={0.9}
      >
        Walk. Connect. Community.
      </Text>
    </Animated.View>
  );
}
