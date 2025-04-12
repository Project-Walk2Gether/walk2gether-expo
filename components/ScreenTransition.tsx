import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Platform, StyleSheet, View } from "react-native";

interface ScreenTransitionProps {
  children: ReactNode;
}

/**
 * A component that wraps screen content and provides a
 * sequential fade-out-then-fade-in transition effect.
 */
const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handles the fade-in animation when the screen becomes focused
  useEffect(() => {
    if (isFocused && !isTransitioning) {
      // Start with opacity at 0
      opacity.setValue(0);

      // Delay slightly to ensure previous screen has faded out
      const timer = setTimeout(() => {
        // Animate opacity to 1 over 250ms
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isFocused, isTransitioning]);

  // Handle back button press and gesture back navigation
  useEffect(() => {
    // Add listener for programmatic navigation
    const unsubscribeBlur = navigation.addListener("beforeRemove", (e) => {
      // Prevent immediate navigation
      if (!isTransitioning) {
        e.preventDefault();
        setIsTransitioning(true);

        // Animate opacity to 0 when leaving
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Continue with navigation after animation completes
          setIsTransitioning(false);
          navigation.dispatch(e.data.action);
        });
      }
    });

    // Handle hardware back button on Android
    const backHandler = Platform.OS === 'android'
      ? BackHandler.addEventListener('hardwareBackPress', () => {
          if (isFocused && !isTransitioning && navigation.canGoBack()) {
            setIsTransitioning(true);
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              setIsTransitioning(false);
              navigation.goBack();
            });
            return true; // Prevent default back action
          }
          return false;
        })
      : { remove: () => {} };

    return () => {
      unsubscribeBlur();
      backHandler.remove();
    };
  }, [navigation, isTransitioning, isFocused]);

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

export default ScreenTransition;
