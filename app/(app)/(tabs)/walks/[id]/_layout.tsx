import FullScreenLoader from "@/components/FullScreenLoader";
import HeaderBackButton from "@/components/HeaderBackButton";
import ActiveRoundIndicator from "@/components/Rounds/ActiveRoundIndicator";
import WalkMenu from "@/components/WalkMenu";
import { useAuth } from "@/context/AuthContext";
import { WalkProvider } from "@/context/WalkContext";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
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
      <Stack.Screen
        options={{
          title: getWalkTitle(walk, user?.uid),
          headerLeft: () => <HeaderBackButton onPress={goBack} />,
          headerRight: () => <WalkMenu walk={walk} afterDelete={goBack} />,
        }}
      />
      <WalkProvider
        walk={walk}
        goBack={goBack}
        participants={participants || null}
        currentUserParticipantDoc={currentUserParticipantDoc}
        isLoadingParticipants={isLoadingParticipants}
      >
        <View flex={1}>
          <StatusBar style="dark" />
          {walk.type === "meetup" && walk.startedAt && !walk.endedAt && (
            <ActiveRoundIndicator walkId={id} />
          )}
          <MaterialTopTabs
            initialRouteName={initialRouteName}
            screenOptions={{
              // swipeEnabled: false, // Disable horizontal swipe navigation
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
            <MaterialTopTabs.Screen name="map" options={{ title: "Meet" }} />
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
