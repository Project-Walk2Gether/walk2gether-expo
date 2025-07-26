import FullScreenLoader from "@/components/FullScreenLoader";
import WalkHeader from "@/components/WalkHeader";
import { useAuth } from "@/context/AuthContext";
import { WalkProvider } from "@/context/WalkContext";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import {
  router,
  useLocalSearchParams,
  useNavigation,
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
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const { user } = useAuth();
  const { doc: walk, status } = useDoc<Walk>(`walks/${id}`);

  const navigation = useNavigation();

  // Get participants for the walk
  const participants = useWalkParticipants(id || "");
  const isLoadingParticipants = !participants && !!id;

  // Get the current user's participant document
  const currentUserParticipantDoc = participants?.find(
    (participant) => participant.userUid === user?.uid
  );

  if (status === "loading" || !walk || isLoadingParticipants) {
    return <FullScreenLoader />;
  }

  // TODO: if the walk is soon,
  const initialRouteName = "details";

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <WalkProvider
        walk={walk}
        goBack={goBack}
        participants={participants || null}
        currentUserParticipantDoc={currentUserParticipantDoc}
        isLoadingParticipants={isLoadingParticipants}
      >
        <WalkHeader goBack={goBack} />
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
            <MaterialTopTabs.Screen name="meet" options={{ title: "Meet" }} />
            <MaterialTopTabs.Screen
              name="details"
              options={{ title: "Walk" }}
            />
            <MaterialTopTabs.Screen name="chat" options={{ title: "Talk" }} />
          </MaterialTopTabs>
        </View>
      </WalkProvider>
    </>
  );
}
