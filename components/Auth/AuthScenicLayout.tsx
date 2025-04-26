import Birds from "components/Birds";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, YStack } from "tamagui";
import Clouds from "../Clouds";
import Sun from "../Sun";
import { BrandGradient } from "../UI";
import BottomRow from "./BottomRow";
import WalkingCharacters from "./WalkingCharacters";

const getTopPadding = (screenHeight: number): number => {
  const isLargeScreen = screenHeight > 700;
  return isLargeScreen ? 50 : 20;
};

export interface AuthScenicLayoutProps {
  children: React.ReactNode;
  showLogo?: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: any;
  showSun?: boolean;
  showTree?: boolean;
  showHouse?: boolean;
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
}: AuthScenicLayoutProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } =
    require("react-native").Dimensions.get("window");

  const ScrollOrView = scroll ? ScrollView : View;

  return (
    <BrandGradient style={{ flex: 1 }}>
      {showSun && (
        <Sun style={{ position: "absolute", left: 0, top: 20, zIndex: 1 }} />
      )}
      <Clouds style={{ position: "absolute", top: -100, left: 0, zIndex: 1 }} />
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
        {showTree && (
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
        )}
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
            paddingTop: insets.top + getTopPadding(screenHeight),
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
