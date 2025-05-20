import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Text } from "tamagui";

export function Slogan({ delay = 2500 }: { delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current; // Start 20 pixels below target position
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        })
      ]).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, opacity, translateY]);
  
  return (
    <Animated.View 
      style={{ 
        opacity,
        transform: [{ translateY }] 
      }}
    >
      <Text
        fontSize={20}
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
