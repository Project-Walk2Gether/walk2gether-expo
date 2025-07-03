import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { isDetox } from "../../utils/launchArgs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, YStack } from "tamagui";
import Birds from "../Birds";
import Clouds from "../Clouds";
import Sun from "../Sun";
import { BrandGradient } from "../UI";
import BottomRow from "./BottomRow";
import WalkingCharacters from "./WalkingCharacters";

export interface AuthScenicLayoutProps {
  children: React.ReactNode;
  showLogo?: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: any;
  showSun?: boolean;
  showTree?: boolean;
  isAnimated?: boolean;
}

const { width } = Dimensions.get("screen");
const tree = require("../../assets/animations/tree.lottie");
const groundAspectRatio = 374 / 1489;

export default function AuthScenicLayout({
  children,
  showLogo,
  scroll = true,
  contentContainerStyle = {},
  showSun = true,
  showTree = true,
  isAnimated = false,
}: AuthScenicLayoutProps) {
  const insets = useSafeAreaInsets();
  const sunAnimation = useRef(new Animated.Value(-100)).current;
  const cloudsAnimation = useRef(new Animated.Value(-200)).current;
  const cloudsOpacity = useRef(new Animated.Value(isAnimated ? 0 : 1)).current;

  // Run animations when component mounts if isAnimated is true and not in test mode
  useEffect(() => {
    if (isAnimated && !isDetox) {
      // Animate sun from left
      Animated.timing(sunAnimation, {
        toValue: 0,
        duration: 1200,
        delay: 1000,
        useNativeDriver: true,
      }).start();

      // Animate clouds from top with parallel animations for position and opacity
      Animated.parallel([
        Animated.timing(cloudsAnimation, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(cloudsOpacity, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAnimated, sunAnimation, cloudsAnimation, cloudsOpacity]);

  const ScrollOrView = scroll ? ScrollView : View;

  return (
    <BrandGradient variant="outdoor" style={{ flex: 1 }}>
      {showSun && (
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            top: 20,
            zIndex: 1,
            transform: [{ translateX: isAnimated ? sunAnimation : 0 }],
          }}
        >
          <Sun />
        </Animated.View>
      )}

      {/* Animated clouds only when animation is enabled */}
      <Animated.View
        style={{
          position: "absolute",
          top: -80,
          width,
          left: 0,
          zIndex: 1,
          opacity: cloudsOpacity,
          transform: [{ translateY: cloudsAnimation }],
        }}
      >
        <Clouds />
      </Animated.View>

      <Birds />

      <BottomRow />

      {/* Walking Scene */}
      <YStack
        width="100%"
        height={120}
        position="absolute"
        bottom={0}
        left={0}
        zIndex={2}
      >
        <Image
          source={require("../../assets/ground.png")}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width,
            height: width * groundAspectRatio,
            resizeMode: "cover",
          }}
        />
        {showTree && !isDetox ? (
          <LottieView
            style={{
              position: "absolute",
              bottom: -120,
              left: -370,
              width: 750,
              height: 750,
            }}
            source={tree}
            autoPlay
            loop
            speed={0.15}
          />
        ) : showTree ? (
          <View
            style={{
              position: "absolute",
              bottom: -120,
              left: -370,
              width: 750,
              height: 750,
            }}
          />
        ) : null}
        <WalkingCharacters
          style={{
            position: "absolute",
            bottom: -18,
            width: "100%",
          }}
        />
      </YStack>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, zIndex: 100 }}
      >
        <ScrollOrView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 100,
            paddingTop: insets.top + 35,
            ...contentContainerStyle,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showLogo}
          {children}
        </ScrollOrView>
      </KeyboardAvoidingView>
    </BrandGradient>
  );
}
