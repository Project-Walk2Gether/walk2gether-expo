import storage from "@react-native-firebase/storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { YStack, Button, Text } from "tamagui";
import { showMessage } from "react-native-flash-message";
import { SafeAreaView } from "react-native-safe-area-context"; // Replace with Tamagui's SafeAreaView if available
import { PlaceData } from "../../../components/UI/PlacesAutocomplete";
import { UserDataForm } from "../../../components/UserDataForm";
import { useAuth } from "../../../context/AuthContext";
import { useUserData } from "../../../context/UserDataContext";
import { COLORS } from "../../../styles/colors";
import { appVersion } from "../../../utils/version";

export default function ProfileScreen() {
  const { user: authUser, refreshToken, signOut } = useAuth();
  const { userData, loading: userDataLoading, updateUserData } = useUserData();
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState<PlaceData | null>(null);
  const [aboutMe, setAboutMe] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Update local state when userData changes
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");

      // Handle location differently based on what's stored in userData
      if (userData.location) {
        if (typeof userData.location === "string") {
          // Legacy format: just a location string
          setLocation({
            name: userData.location,
            placeId: "",
            latitude: 0,
            longitude: 0,
          });
        } else {
          // New format: complete location object
          setLocation(userData.location as PlaceData);
        }
      } else {
        setLocation(null);
      }

      setAboutMe(userData.aboutMe || "");
      setProfilePicUrl(userData.profilePicUrl || "");
    }
  }, [userData]);

  // Removed pickImage: now handled by ProfilePicturePicker

  const uploadImage = async (uri: string) => {
    if (!authUser) return;

    try {
      setIsSaving(true);

      // Create a reference to the file in Firebase Storage
      const filename = `user/${
        authUser.uid
      }/profile-pictures/${Date.now()}.jpg`;
      const reference = storage().ref(filename);

      // Convert URI to blob for React Native
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload the file
      await reference.put(blob);

      // Get the download URL
      const downloadURL = await reference.getDownloadURL();

      // Update the user's profile picture URL in Firestore
      await updateUserData({ profilePicUrl: downloadURL });

      // Update local state
      setProfilePicUrl(downloadURL);

      showMessage({
        message: "Success",
        description: "Profile picture updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      showMessage({
        message: "Error",
        description: "Failed to upload image",
        type: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      // Update user data in Firestore
      await updateUserData({
        name,
        location: location || "",
        aboutMe,
      });

      showMessage({
        message: "Success",
        description: "Profile updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      showMessage({
        message: "Error",
        description: "Failed to update profile",
        type: "danger",
      });
    } finally {
      setIsSaving(false);

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (userDataLoading) {
    return (
      <YStack f={1} jc="center" ai="center" bg="#fff" width="100%" height="100%">
        <ActivityIndicator size="large" color={COLORS.action} />
      </YStack>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ padding: 20 }}
    >
      {userData && (
        <UserDataForm
          userData={userData}
          onSave={({ name, aboutMe, location }) => {
            setName(name);
            setAboutMe(aboutMe);
            setLocation(location);
            handleSaveProfile();
          }}
          isSaving={isSaving}
        />
      )}

      <YStack mt={30} ai="center">
        <Text fontSize={12} color="$gray10" opacity={0.7}>
          Version: {appVersion}
        </Text>
      </YStack>

      <Button
        mt="$4"
        variant="outlined"
        borderColor="#ff3b30"
        color="#ff3b30"
        borderWidth={1}
        borderRadius={8}
        py={15}
        onPress={handleSignOut}
        disabled={isSaving}
        width="100%"
      >
        <Text fontSize={16} fontWeight="600" color="#ff3b30">
          Sign Out
        </Text>
      </Button>
    </ScrollView>
  );
}

