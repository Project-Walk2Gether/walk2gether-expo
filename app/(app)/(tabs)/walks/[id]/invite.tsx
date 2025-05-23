import HeaderCloseButton from "@/components/HeaderCloseButton";
import InviteSelection from "@/components/WalkWizard/sections/InviteSelection";
import WalkCard from "@/components/WalkCard";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { ScrollView, Text, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";

export default function InviteScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const router = useRouter();

  // Get walk data
  const { doc: walk, status: walkStatus } = useDoc<Walk>(`walks/${id}`);
  const walkLoading = walkStatus === "loading";

  if (walkLoading || !walk) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Loading...",
            headerRight: () => <HeaderCloseButton />,
            headerShadowVisible: false,
          }}
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    );
  }

  // Check if user is the creator of the walk
  if (user?.uid !== walk.createdByUid) {
    return (
      <>
        <Stack.Screen
          options={{
            title: walk?.type === "neighborhood" ? "Notify Neighbors" : "Invite Friends",
            headerRight: () => <HeaderCloseButton />,
            headerShadowVisible: false,
          }}
        />
        <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
          <Text fontSize={18} textAlign="center">
            Only the creator of this walk can invite friends.
          </Text>
        </View>
      </>
    );
  }

  // The friend toggling, invitation link generation, and sharing functionality
  // are now all handled by the InviteSelection component

  return (
    <>
      <Stack.Screen
        options={{
          title: walk.type === "neighborhood" ? "Notify Neighbors" : "Invite Friends",
          headerRight: () => <HeaderCloseButton />,
          headerShadowVisible: false,
        }}
      />
      {/* Render the InviteSelection component directly */}
      {walk && (
        <InviteSelection
          onContinue={() => router.back()} // Close the screen when Done is pressed
          walkId={id} // Pass the walk ID from the route params
          walkType={walk.type} // Pass the walk type
          invitationCode={walk.invitationCode} // Pass the walk's invitation code
        />
      )}
    </>
  );
}
