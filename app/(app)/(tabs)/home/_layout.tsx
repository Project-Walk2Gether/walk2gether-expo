import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { User } from "@tamagui/lucide-icons";
import { useRouter, withLayoutContext } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Button, Text, View } from "tamagui";
import { BrandGradient, ScreenTitle } from "../../../../components/UI";
import { useUserData } from "../../../../context/UserDataContext";
import { COLORS } from "../../../../styles/colors";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function HomeTabsLayout() {
  const router = useRouter();
  const { userData } = useUserData();
  const insets = useSafeAreaInsets();

  return (
    <BrandGradient style={{ flex: 1, paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View paddingHorizontal={20}>
        <ScreenTitle
          rightAction={
            userData && userData.profilePicUrl ? (
              <Avatar
                size="$3"
                circular
                onPress={() => router.push("/profile")}
                pressStyle={{ opacity: 0.8, scale: 0.97 }}
              >
                <Avatar.Image src={userData.profilePicUrl} />
                <Avatar.Fallback backgroundColor={COLORS.action}>
                  <Text color="white" fontWeight="bold">
                    {userData.name
                      ? userData.name.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </Avatar.Fallback>
              </Avatar>
            ) : (
              <Button
                size="$3"
                circular
                icon={<User size="$1.5" color={COLORS.action} />}
                borderColor={COLORS.action}
                borderWidth={1}
                onPress={() => router.push("/profile")}
                pressStyle={{ opacity: 0.8, scale: 0.97 }}
              />
            )
          }
        >
          Walks
        </ScreenTitle>
      </View>
      {/* MaterialTopTabs needs to be wrapped in RNView since it doesn't accept Tamagui props */}
      <RNView style={{ flex: 1, zIndex: 1 }}>
        <MaterialTopTabs
          screenOptions={{
            tabBarStyle: {
              backgroundColor: "transparent", // ⬅️ 100 % see-through
              elevation: 0, // Android: remove drop-shadow
              shadowOpacity: 0, // iOS: remove drop-shadow
              borderBottomWidth: 0, // if you had a hairline
            },
            // keep the little blue line visible & on-brand
            tabBarIndicatorStyle: {
              backgroundColor: COLORS.action,
              height: 3,
              borderRadius: 1.5,
            },
            tabBarLabelStyle: {
              backgroundColor: "transparent",
              borderBottomColor: "rgba(0,0,0,1)",
              borderBottomWidth: 1,
              fontWeight: "600",
            },
          }}
          style={{ backgroundColor: "transparent" }}
        >
          <MaterialTopTabs.Screen name="active" options={{ title: "Active" }} />
          <MaterialTopTabs.Screen
            name="history"
            options={{ title: "History" }}
          />
        </MaterialTopTabs>
      </RNView>
    </BrandGradient>
  );
}
