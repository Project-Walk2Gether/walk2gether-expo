import { useIsFocused } from "@react-navigation/native";
import React, { ReactNode, useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface TabScreenWrapperProps {
  children: ReactNode;
}

/**
 * A component that wraps tab screen content and provides a fade transition effect
 * when switching between tabs.
 */
const TabScreenWrapper: React.FC<TabScreenWrapperProps> = ({ children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const wasInitiallyFocused = useRef(false);

  useEffect(() => {
    // When first mounting a tab that's already focused, fade in immediately with shorter delay
    if (isFocused && !wasInitiallyFocused.current) {
      opacity.setValue(0);
      wasInitiallyFocused.current = true;
      
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } 
    // For subsequent focus changes
    else if (isFocused) {
      // Animate opacity to 1 (fade in)
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate opacity to 0 (fade out)
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity }]}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default TabScreenWrapper;
