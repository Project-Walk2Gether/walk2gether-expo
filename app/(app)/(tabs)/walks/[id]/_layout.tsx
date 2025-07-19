import FullScreenLoader from "@/components/FullScreenLoader";
import HeaderBackButton from "@/components/HeaderBackButton";
import WalkMenu from "@/components/WalkMenu";
import { useAuth } from "@/context/AuthContext";
import { WalkProvider } from "@/context/WalkContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { getWalkTitle } from "@/utils/walkType";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import {
  router,
  Stack,
  useLocalSearchParams,
  withLayoutContext,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "tamagui";
import { Walk } from "walk2gether-shared";

// Set up Material Top Tabs navigator
const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function WalkLayout() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const { doc: walk, status } = useDoc<Walk>(`walks/${id}`);

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
        <View flex={1}>
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
            <MaterialTopTabs.Screen
              name="details"
              options={{ title: "Details" }}
            />
            <MaterialTopTabs.Screen name="map" options={{ title: "Map" }} />
            <MaterialTopTabs.Screen name="chat" options={{ title: "Chat" }} />
          </MaterialTopTabs>
        </View>
      </WalkProvider>
    </>
  );
}
