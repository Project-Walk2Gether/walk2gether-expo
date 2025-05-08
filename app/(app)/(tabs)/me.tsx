import { MaterialIcons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import storage from "@react-native-firebase/storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { Button, Text, YStack, XStack, View } from "tamagui";
import { Location, UserData } from "walk2gether-shared";
import { BrandGradient } from "../../../components/UI";
import { PlaceData } from "../../../components/UI/PlacesAutocomplete";
import { UserDataForm } from "../../../components/UserDataForm";
import { useAuth } from "../../../context/AuthContext";
import { useFlashMessage } from "../../../context/FlashMessageContext";
import { useUserData } from "../../../context/UserDataContext";
import { COLORS } from "../../../styles/colors";
import { appVersion } from "../../../utils/version";

// UIDInfo component for showing user ID and app version
const UIDInfo: React.FC<{ uid: string; version: string }> = ({
  uid,
  version,
}) => {
  const { showMessage } = useFlashMessage();
  
  const handleCopy = () => {
    Clipboard.setString(uid);
    showMessage("User ID copied to clipboard!", "success");
  };
  
  return (
    <YStack mt={10} ai="center" mb={20}>
      <Text
        fontSize={12}
        color="$gray10"
        opacity={0.7}
        selectable
        onPress={handleCopy}
        pressStyle={{ opacity: 0.5 }}
        style={{ textAlign: "center" }}
        mb="$2"
      >
        Version: {version}
      </Text>

      <Text
        fontSize={12}
        color="$gray10"
        opacity={0.7}
        selectable
        onPress={handleCopy}
        pressStyle={{ opacity: 0.5 }}
        style={{ textAlign: "center" }}
      >
        User ID: {uid}
      </Text>

      <Text
        fontSize={10}
        color="$gray10"
        opacity={0.5}
        style={{ textAlign: "center" }}
      >
        Tap to copy
      </Text>
    </YStack>
  );
};

export default function MeScreen() {
  const { user: authUser, signOut } = useAuth();
  const { userData, loading: userDataLoading, updateUserData } = useUserData();
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState<PlaceData | null>(null);
  const [aboutMe, setAboutMe] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

  const { showMessage } = useFlashMessage();

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

      showMessage("Profile picture updated successfully", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showMessage("Failed to upload image", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      // Make sure location has the correct structure that matches Location type
      const formattedLocation: Location | null = location ? {
        name: location.name,
        placeId: location.placeId || "", // Ensure placeId is never undefined
        latitude: location.latitude,
        longitude: location.longitude
      } : null;
      
      // Create a partial UserData object to update
      const updateData: Partial<UserData> = {
        name,
        location: formattedLocation,
        aboutMe
      };

      // Update user data in Firestore
      await updateUserData(updateData);

      showMessage("Profile updated successfully", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      showMessage("Failed to update profile", "error");
    } finally {
      setIsSaving(false);
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
      <YStack
        f={1}
        jc="center"
        ai="center"
        bg="#fff"
        width="100%"
        height="100%"
      >
        <ActivityIndicator size="large" color={COLORS.action} />
      </YStack>
    );
  }

  return (
    <BrandGradient style={{ flex: 1 }}>
      <YStack f={1} padding="$4">
        <XStack justifyContent="space-between" marginBottom="$4">
          <Text fontSize={28} fontWeight="bold" color="$gray12">
            My Profile
          </Text>
          <Button
            backgroundColor={COLORS.primary}
            size="$3"
            circular
            color="#fff"
            borderRadius={10}
            onPress={() => router.push("/qr-code")}
            icon={<MaterialIcons name="qr-code-2" color={"white"} size={24} />}
          />
        </XStack>
        
        <View
          backgroundColor="white"
          borderRadius={16}
          shadowColor="black"
          shadowOpacity={0.1}
          shadowRadius={10}
          flex={1}
        >
          <ScrollView ref={scrollViewRef} contentContainerStyle={{ padding: 20 }}>
            {userData && (
              <UserDataForm
                userData={{
                  name: userData.name,
                  aboutMe: userData.aboutMe,
                  profilePicUrl: userData.profilePicUrl,
                  location: userData.location as PlaceData | null
                }}
                onSave={({ name: newName, aboutMe: newAboutMe, location: newLocation }) => {
                  setName(newName);
                  setAboutMe(newAboutMe);
                  setLocation(newLocation);
                  handleSaveProfile();
                }}
                isSaving={isSaving}
              />
            )}
            <Button
              variant="outlined"
              borderColor="#ff3b30"
              color="#ff3b30"
              borderWidth={1}
              borderRadius={8}
              onPress={handleSignOut}
              disabled={isSaving}
              width="100%"
            >
              <Text fontSize={16} fontWeight="600" color="#ff3b30">
                Sign Out
              </Text>
            </Button>
            {authUser?.uid && (
              <UIDInfo uid={authUser.uid} version={`${appVersion}.patch`} />
            )}
          </ScrollView>
        </View>
      </YStack>
    </BrandGradient>
  );
}
