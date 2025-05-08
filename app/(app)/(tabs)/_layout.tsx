import { useUserData } from "context/UserDataContext"";
import { Footprints, Image, User, Users } from "@tamagui/lucide-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { COLORS } from "../../../styles/colors";

export default function TabLayout() {
  const { userData, loading: userDataLoading } = useUserData();

  if (!userDataLoading && !userData) {
    return <Redirect href="/onboarding/complete-your-profile" />;
  }
  return (
    <Tabs
      initialRouteName="walks"
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: "#E0E0E0",
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
      }}
    >
      <Tabs.Screen
        name="walks"
        options={{
          title: "Let's Walk!",
          tabBarIcon: ({ color, size }) => (
            <Footprints size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: "Stories",
          tabBarIcon: ({ color, size }) => <Image size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
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
    </Tabs>
  );
}
