import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View } from "tamagui";
import Clouds from "../Clouds";
import Sun from "../Sun";
import { BrandGradient } from "../UI";
import BottomRow from "./BottomRow";
import WalkingScene from "./WalkingScene";

const getTopPadding = (screenHeight: number): number => {
  const isLargeScreen = screenHeight > 700;
  return isLargeScreen ? 120 : 80;
};

export interface AuthScenicLayoutProps {
  children: React.ReactNode;
  showLogo?: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: any;
  showSun?: boolean;
  showBottomRow?: boolean;
  showTree?: boolean;
  showHouse?: boolean;
}

export default function AuthScenicLayout({
  children,
  showLogo,
  scroll = true,
  contentContainerStyle = {},
  showSun = true,
  showBottomRow = true,
  showTree = true,
  showHouse = false,
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
      <WalkingScene
        style={{ position: "absolute", bottom: 0, left: 0, zIndex: 2 }}
        showTree={showTree}
      />
      {showBottomRow && <BottomRow />}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
