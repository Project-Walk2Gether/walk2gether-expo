import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';

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
  progressText = 'Loading',
  onComplete,
}) => {
  const [internalProgress, setInternalProgress] = useState(0);
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [displayedProgress, setDisplayedProgress] = useState(0);
  
  // Listen to animated value changes
  useEffect(() => {
    const listener = animatedProgress.addListener(({ value }) => {
      setDisplayedProgress(Math.floor(value * 100));
    });

    return () => {
      animatedProgress.removeListener(listener);
    };
  }, [animatedProgress]);

  // Handle manual progress updates
  useEffect(() => {
    if (progress !== undefined) {
      // Quickly animate to the provided progress
      Animated.timing(animatedProgress, {
        toValue: progress / 100,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();
      
      setInternalProgress(progress);
      
      if (progress >= 100 && onComplete) {
        setTimeout(onComplete, 500);
      }
    }
  }, [progress, onComplete]);

  // Auto progress animation to 90%
  useEffect(() => {
    if (progress === undefined) {
      // Animate to 90% over the expected wait time
      Animated.timing(animatedProgress, {
        toValue: 0.9,
        duration: expectedWaitTime,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start();
      
      setInternalProgress(90);
    }
  }, [expectedWaitTime, progress]);

  // Complete the animation when internal progress is set to 100
  useEffect(() => {
    if (internalProgress >= 100) {
      Animated.timing(animatedProgress, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [internalProgress, onComplete]);

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
            height: '100%',
            width: animatedProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: '#22c55e',
            borderRadius: height / 2,
          }}
        />
      </XStack>
      
      {showText && displayedProgress < 100 && (
        <Text 
          fontSize={12} 
          color="$gray900" 
          textAlign="center"
          marginTop={4}
        >
          {`${progressText}... ${displayedProgress}%`}
        </Text>
      )}
    </YStack>
  );
};

export default FakeLoadingBar;
