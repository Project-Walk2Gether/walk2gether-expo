import { Bell, Footprints, Users } from "@tamagui/lucide-icons";
import { Tabs } from "expo-router";
import React from "react";
import NotificationBell from "../../../components/NotificationBell";
import { ProfileButton } from "../../../components/ProfileButton";
import { COLORS } from "../../../styles/colors";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="walks"
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        headerShown: false,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: "transparent" },
        headerStyle: {
          backgroundColor: "#ffffff",
          elevation: 0,
          shadowColor: "transparent",
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: "transparent",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          // Slightly reduce height and add margin for distinction
          height: 60,
          marginBottom: 3,
          marginHorizontal: 8,
          borderRadius: 12,
        },
        headerRight: () => (
          <React.Fragment>
            <NotificationBell />
            <ProfileButton />
          </React.Fragment>
        ),
      }}
    >
      <Tabs.Screen
        name="walks"
        options={{
          title: "Walks",
          tabBarIcon: ({ color, size }) => (
            <Footprints size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerShown: true,
          headerTitle: "Notifications",
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
