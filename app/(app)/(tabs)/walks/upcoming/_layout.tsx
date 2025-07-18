import React from "react";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions } from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { Stack, Slot, withLayoutContext, useLocalSearchParams, router } from "expo-router";
import { View } from "tamagui";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/styles/colors";
import HeaderBackButton from "@/components/HeaderBackButton";
import { useDoc } from "@/utils/firestore";
import { Walk } from "walk2gether-shared";
import { WalkProvider } from "@/context/WalkContext";
import FullScreenLoader from "@/components/FullScreenLoader";
import { getWalkTitle } from "@/utils/walkType";
import { useAuth } from "@/context/AuthContext";
import WalkMenu from "@/components/WalkMenu";

// Set up Material Top Tabs navigator
const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function UpcomingWalkLayout() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const { doc: walk, status } = useDoc<Walk>(`walks/${id}`);
  const insets = useSafeAreaInsets();

  if (status === "loading" || !walk) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: getWalkTitle(walk, user?.uid),
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => (
            <WalkMenu
              walk={walk}
              afterDelete={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
            />
          ),
        }}
      />
      <WalkProvider walk={walk}>
        <View flex={1} style={{ paddingTop: insets.top }}>
          <StatusBar style="dark" />
          
          <MaterialTopTabs
            screenOptions={{
              tabBarStyle: {
                backgroundColor: "transparent",
                elevation: 0, // Android: remove drop-shadow
                shadowOpacity: 0, // iOS: remove drop-shadow
                borderBottomWidth: 0, // if you had a hairline
              },
              tabBarIndicatorStyle: {
                backgroundColor: COLORS.action,
                height: 3,
                borderRadius: 1.5,
              },
              tabBarLabelStyle: {
                backgroundColor: "transparent",
                fontWeight: "600",
                fontSize: 14,
              },
            }}
            style={{ backgroundColor: "transparent" }}
          >
            <MaterialTopTabs.Screen name="details" options={{ title: "Details" }} />
            <MaterialTopTabs.Screen name="participants" options={{ title: "Participants" }} />
            <MaterialTopTabs.Screen name="chat" options={{ title: "Chat" }} />
          </MaterialTopTabs>
        </View>
      </WalkProvider>
    </>
  );
}
