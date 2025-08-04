import HeaderCloseButton from "@/components/HeaderCloseButton";
import InviteSelection from "@/components/WalkWizard/sections/InviteSelection";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import firestore from "@react-native-firebase/firestore";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Spinner, YStack } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";

export default function InviteFriendsScreen() {
  const { userData } = useUserData();
  const { showMessage } = useFlashMessage();
  const { walkId, addFriend } = useLocalSearchParams<{
    walkId?: string;
    addFriend?: string;
  }>();

  const [walk, setWalk] = useState<WithId<Walk> | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to get the screen title based on parameters
  const getScreenTitle = () => {
    if (addFriend === "true" && walkId) {
      return "Invite to Walk & Connect";
    } else if (addFriend === "true") {
      return "Add Friend";
    } else if (walkId) {
      return "Invite to Walk";
    } else {
      return "Share App";
    }
  };

  // Fetch walk data if walkId is provided
  useEffect(() => {
    if (!walkId) {
      setLoading(false);
      return;
    }

    const fetchWalk = async () => {
      try {
        const walkDoc = await firestore().collection("walks").doc(walkId).get();
        if (walkDoc.exists()) {
          setWalk({ id: walkDoc.id, ...walkDoc.data() } as WithId<Walk>);
        } else {
          showMessage("Walk not found", "error");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching walk:", error);
        showMessage("Error loading walk", "error");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchWalk();
  }, [walkId]);

  const handleContinue = () => {
    // Close the modal
    router.back();
  };

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerRight: () => <HeaderCloseButton />,
            title: getScreenTitle(),
          }}
        />
        <StatusBar style="light" />
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" />
        </YStack>
      </>
    );
  }

  // If no walkId, show a simple message (for "Share App" case)
  if (!walkId) {
    // Show alert and navigate back
    Alert.alert(
      "Feature not implemented",
      "App sharing functionality will be added in a future update.",
      [{ text: "OK", onPress: () => router.back() }]
    );

    return (
      <>
        <Stack.Screen
          options={{
            headerRight: () => <HeaderCloseButton />,
            title: getScreenTitle(),
          }}
        />
        <StatusBar style="light" />
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$4"
        >
          <Spinner size="large" />
        </YStack>
      </>
    );
  }

  // If we have a walk, use the InviteSelection component
  if (!walk) {
    // Show alert and navigate back
    Alert.alert(
      "Walk not found",
      "The walk you are trying to invite people to could not be found.",
      [{ text: "OK", onPress: () => router.back() }]
    );

    return (
      <>
        <Stack.Screen
          options={{
            headerRight: () => <HeaderCloseButton />,
            title: getScreenTitle(),
          }}
        />
        <StatusBar style="light" />
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$4"
        >
          <Spinner size="large" />
        </YStack>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <HeaderCloseButton />,
          title: getScreenTitle(),
        }}
      />
      <StatusBar style="light" />
      <InviteSelection
        walk={walk}
        walkId={walk.id}
        walkType={walk.type}
        onContinue={handleContinue}
      />
    </>
  );
}
