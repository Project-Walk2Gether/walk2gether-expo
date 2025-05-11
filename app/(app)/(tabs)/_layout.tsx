import { useUpdates } from "@/context/UpdatesContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { Bell, Footprints, User, Users } from "@tamagui/lucide-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { View } from "tamagui";

export default function TabLayout() {
  const { userData, loading: userDataLoading } = useUserData();
  const { isUpdateAvailable } = useUpdates();

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
          paddingTop: 6,
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
        name="friends"
        options={{
          title: "Friends",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <View position="relative">
              <User size={size} color={color} />
              {isUpdateAvailable && (
                <View
                  position="absolute"
                  top={-5}
                  right={-10}
                  width={18}
                  height={18}
                  borderRadius={9}
                  backgroundColor={COLORS.accent1}
                  justifyContent="center"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="white"
                >
                  <Bell size={12} color="white" />
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
