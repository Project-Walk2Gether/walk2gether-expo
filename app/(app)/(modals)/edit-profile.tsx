import HeaderCloseButton from "@/components/HeaderCloseButton";
import { PlaceData } from "@/components/UI/PlacesAutocomplete";
import { UserDataForm } from "@/components/UserDataForm";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { Stack as ExpoStack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { YStack } from "tamagui";
import { Location, UserData } from "walk2gether-shared";

export default function EditProfileScreen() {
  const router = useRouter();
  const { userData, loading, updateUserData } = useUserData();
  const { showMessage } = useFlashMessage();
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async ({
    name: newName,
    aboutMe: newAboutMe,
    location: newLocation,
  }: {
    name: string;
    aboutMe?: string;
    location?: PlaceData | null;
  }) => {
    try {
      setIsSaving(true);

      // Make sure location has the correct structure that matches Location type
      const formattedLocation: Location | null = newLocation
        ? {
            name: newLocation.name,
            displayName: newLocation.displayName || newLocation.name, // Include displayName field
            placeId: newLocation.placeId || "", // Ensure placeId is never undefined
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          }
        : null;

      // Create a partial UserData object to update
      const updateData: Partial<UserData> = {
        name: newName,
        location: formattedLocation,
        aboutMe: newAboutMe,
      };

      // Update user data in Firestore
      await updateUserData(updateData);

      showMessage("Profile updated successfully", "success");
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
      showMessage("Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </YStack>
    );
  }

  return (
    <>
      <ExpoStack.Screen
        options={{
          title: "Edit Profile",
          headerRight: () => <HeaderCloseButton />,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <YStack flex={1} backgroundColor="white">
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {userData && (
              <UserDataForm
                userData={{
                  name: userData.name,
                  aboutMe: userData.aboutMe,
                  location: userData.location as PlaceData | null,
                }}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
          </ScrollView>
        </YStack>
      </KeyboardAvoidingView>
    </>
  );
}
