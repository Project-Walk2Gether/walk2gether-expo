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
import { differenceInHours } from "date-fns";
import {
  router,
  Stack,
  useLocalSearchParams,
  useNavigation,
  withLayoutContext,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
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
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const { user } = useAuth();
  const { doc: walk, status } = useDoc<Walk>(`walks/${id}`);

  const navigation = useNavigation();

  // Get walk title
  const walkTitle = useMemo(() => {
    if (!walk) return "";
    return getWalkTitle(walk, user?.uid);
  }, [walk, user?.uid]);

  // Note: Participants are now handled internally by WalkProvider

  if (status === "loading" || !walk) {
    return <FullScreenLoader />;
  }

  // If the walk is starting in the next 8 hours, default to the "meet" tab
  const isStartingSoon =
    differenceInHours(new Date(walk.date.toDate()), new Date()) < 8;
  const initialRouteName = isStartingSoon ? "meet" : "plan";

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.push("/");
    }
  };

  return (
    <WalkProvider walk={walk} goBack={goBack}>
      <Stack.Screen
        options={{
          headerTitle: walkTitle,
          headerLeft: () => <HeaderBackButton onPress={goBack} />,
          headerRight: () => <WalkMenu walk={walk} afterDelete={goBack} />,
        }}
      />
      <View flex={1}>
        <StatusBar style="dark" />

        <MaterialTopTabs
          initialRouteName={initialRouteName}
          screenOptions={{
            // Disable horizontal swipe navigation, so that the walk sliders work
            swipeEnabled: false,
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
          <MaterialTopTabs.Screen name="plan" options={{ title: "Plan" }} />
          <MaterialTopTabs.Screen name="meet" options={{ title: "Meet" }} />
          <MaterialTopTabs.Screen
            name="connect"
            options={{ title: "Connect" }}
          />
        </MaterialTopTabs>
      </View>
    </WalkProvider>
  );
}
