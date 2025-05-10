import HeaderBackButton from "@/components/HeaderBackButton";
import { BrandGradient, Screen } from "@/components/UI";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useDoc } from "@/utils/firestore";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Card, Switch, Text, XStack, YStack } from "tamagui";
import {
  NotificationPreferenceInfo,
  notificationPreferenceLabels,
  UserData,
} from "walk2gether-shared";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { showMessage } = useFlashMessage();
  // Use useDoc hook instead of context - this follows the project pattern
  const {
    doc: userData,
    status,
    updateDoc,
  } = useDoc<UserData>(`users/${user?.uid}`);
  const loading = status === "loading";
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Populate preferences from userData when it loads
  useEffect(() => {
    if (userData?.notificationPreferences) {
      const userPrefs: Record<string, boolean> = {};

      // Initialize all preferences from labels with defaults
      Object.keys(notificationPreferenceLabels).forEach((key) => {
        // Default to true if not set
        userPrefs[key] = userData.notificationPreferences?.[key] ?? true;
      });

      setPreferences(userPrefs);
    }
  }, [userData]);

  // Toggle a notification preference
  const togglePreference = async (key: string) => {
    if (!user?.uid || saving) return;

    try {
      setSaving(true);

      // Update local state immediately for responsive UI
      const newPreferences = {
        ...preferences,
        [key]: !preferences[key],
      };
      setPreferences(newPreferences);

      // Use updateDoc from the useDoc hook
      await updateDoc({
        [`notificationPreferences.${key}`]: !preferences[key],
      });

      showMessage("Notification preference updated", "success");
    } catch (error) {
      console.error("Error updating notification preference:", error);

      // Revert local state on error
      setPreferences({ ...preferences });
      showMessage("Failed to update notification preference", "error");
    } finally {
      setSaving(false);
    }
  };

  // Render a preference toggle item
  const renderPreferenceItem = (
    key: string,
    info: NotificationPreferenceInfo
  ) => {
    const value = preferences[key] ?? true;

    return (
      <Card key={key} backgroundColor="white" mb="$3" borderRadius={16}>
        <XStack
          px="$4"
          py="$4"
          alignItems="center"
          justifyContent="space-between"
        >
          <YStack flex={1} mr="$3">
            <Text fontSize={16} fontWeight="600" color="$gray12">
              {info.label}
            </Text>
            <Text fontSize={14} color="$gray11" mt="$1">
              {info.description}
            </Text>
          </YStack>
          <Switch
            checked={value}
            onCheckedChange={() => togglePreference(key)}
            size="$4"
          />
        </XStack>
      </Card>
    );
  };

  if (loading) {
    return (
      <Screen>
        <Stack.Screen
          options={{
            title: "Notification Settings",
            headerLeft: () => <HeaderBackButton color="white" />,
          }}
        />
        <YStack f={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" />
        </YStack>
      </Screen>
    );
  }

  return (
    <BrandGradient style={{ flex: 1 }} variant="subtle">
      <Screen>
        <Stack.Screen
          options={{
            title: "Notification Settings",
            headerLeft: () => <HeaderBackButton />,
          }}
        />

        <YStack px="$4" py="$4">
          <Text fontSize={16} mb="$4">
            Choose which notifications you'd like to receive from Walk2gether.
          </Text>

          {Object.entries(notificationPreferenceLabels).map(([key, info]) =>
            renderPreferenceItem(key, info)
          )}

          {saving && (
            <XStack justifyContent="center" my="$4">
              <ActivityIndicator />
              <Text ml="$2">Saving preferences...</Text>
            </XStack>
          )}
        </YStack>
      </Screen>
    </BrandGradient>
  );
}
