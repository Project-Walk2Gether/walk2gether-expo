import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { User } from "@tamagui/lucide-icons";
import { Slot, useRouter, withLayoutContext } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Button } from "tamagui";
import { ScreenTitle } from "../../../../components/UI";

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
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState(0);

  // Handle tab press
  const handleTabPress = (index: number) => {
    setSelectedTab(index);
    // Navigate to the corresponding page
    if (index === 0) {
      router.replace("/home/active");
    } else {
      router.replace("/home/history");
    }
  };

  // Initialize with active tab selected

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <ScreenTitle
          color="black"
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
                  <Text style={styles.avatarText}>
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
          Welcome{userData ? ", " + userData.name : null}!
        </ScreenTitle>
      </View>

      <View style={{ width: "100%" }}>
        <MaterialTopTabs>
          <MaterialTopTabs.Screen name="active" options={{ title: "Active" }} />
          <MaterialTopTabs.Screen
            name="history"
            options={{ title: "History" }}
          />
        </MaterialTopTabs>
      </View>

      {/* Slot for the actual screen content */}
      <View style={styles.screenContainer}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabNavigatorContainer: {
    zIndex: 1,
  },
  screenContainer: {
    flex: 1,
    zIndex: 0,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
  },
});
