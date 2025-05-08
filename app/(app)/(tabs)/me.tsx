import storage from "@react-native-firebase/storage";
import { LogOut, Pencil, QrCode } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { Camera, Trash } from '@tamagui/lucide-icons';
import { Card, H4, Separator, Text, View, YStack } from "tamagui";
import { Screen, BrandGradient } from "../../../components/UI";
import { PlaceData } from "../../../components/UI/PlacesAutocomplete";
import Menu from "../../../components/Menu";
import UIDInfo from "../../../components/UIDInfo";
import { StatelessAvatar } from "../../../components/UserAvatar";
import { useAuth } from "../../../context/AuthContext";
import { useFlashMessage } from "../../../context/FlashMessageContext";
import { useUserData } from "../../../context/UserDataContext";
import { COLORS } from "../../../styles/colors";
import { appVersion } from "../../../utils/version";

export default function MeScreen() {
  const { user: authUser, signOut } = useAuth();
  const { userData, loading: userDataLoading, updateUserData } = useUserData();
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState<PlaceData | null>(null);
  const [aboutMe, setAboutMe] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when userData changes
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setProfilePicUrl(userData.profilePicUrl || "");
      setAboutMe(userData.aboutMe || "");

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
    }
  }, [userData]);

  const { showMessage } = useFlashMessage();

  const handlePickImage = async () => {
    // Request permissions
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showMessage("Permission to access photos is required", "error");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadImage(result.assets[0].uri);
    }
  };
  
  const handleRemoveImage = async () => {
    if (!authUser) return;
    
    try {
      setIsSaving(true);
      
      // Update the user's profile picture URL in Firestore to null/empty
      await updateUserData({ profilePicUrl: "" });
      
      // Update local state
      setProfilePicUrl("");
      
      showMessage("Profile picture removed", "success");
    } catch (error) {
      console.error("Error removing image:", error);
      showMessage("Failed to remove image", "error");
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleEditProfile = () => {
    // Navigate to the edit profile modal
    router.push("/(app)/(modals)/edit-profile");
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
      <BrandGradient variant="modern" style={{ flex: 1 }}>
        <YStack f={1} jc="center" ai="center" width="100%" height="100%">
          <ActivityIndicator size="large" color={COLORS.action} />
        </YStack>
      </BrandGradient>
    );
  }

  return (
    <Screen title="" gradientVariant="modern">
        <YStack alignItems="center" mb="$6">
          <Menu
            title="Profile Picture"
            snapPoints={[35, 25]}
            items={[
              {
                label: "Change Picture",
                icon: <Camera size={24} color={COLORS.primary} />,
                onPress: handlePickImage,
              },
              {
                label: "Remove Picture",
                icon: <Trash size={24} color={"#ff3b30"} />,
                onPress: handleRemoveImage,
              },
            ]}
            trigger={
              <View position="relative">
                <StatelessAvatar
                  profilePicUrl={profilePicUrl}
                  name={name}
                  size={120}
                  borderWidth={3}
                  backgroundColor={COLORS.primary}
                />
                <View
                  position="absolute"
                  right={0}
                  bottom={0}
                  backgroundColor={COLORS.primary}
                  width={36}
                  height={36}
                  borderRadius={18}
                  justifyContent="center"
                  alignItems="center"
                  borderWidth={2}
                  borderColor="white"
                >
                  <Pencil size={18} color="white" />
                </View>
              </View>
            }
          />
          <H4 mt="$3" mb="$1" fontSize={26} fontWeight="bold" color="white">
            {name || "Your Name"}
          </H4>
          {location && (
            <Text fontSize={16} color="white" opacity={0.9} mb="$2">
              {location.name}
            </Text>
          )}
        </YStack>
        {/* About Me Section */}
        <Card backgroundColor="white" mb="$3" borderRadius={16}>
          <YStack px="$4" py="$3">
            <Text fontSize={16} fontWeight="600" color={COLORS.text} mb="$2">
              About Me
            </Text>
            <Text fontSize={16} color={COLORS.text} opacity={aboutMe ? 1 : 0.7}>
              {aboutMe || "Add some details about yourself..."}
            </Text>
          </YStack>
        </Card>

        {/* Actions Section */}
        <Card backgroundColor="white" mb="$3" borderRadius={16}>
          <TouchableOpacity onPress={() => router.push("/qr-code")}>
            <YStack px="$4" py="$3" flexDirection="row" alignItems="center">
              <View marginRight="$3">
                <QrCode size={24} color={COLORS.primary} />
              </View>
              <Text fontSize={16} fontWeight="500" color={COLORS.text}>
                My QR Code
              </Text>
            </YStack>
          </TouchableOpacity>

          <Separator borderColor="$gray5" />

          <TouchableOpacity onPress={handleEditProfile}>
            <YStack px="$4" py="$3" flexDirection="row" alignItems="center">
              <View marginRight="$3">
                <Pencil size={24} color={COLORS.primary} />
              </View>
              <Text fontSize={16} fontWeight="500" color={COLORS.text}>
                Edit Profile
              </Text>
            </YStack>
          </TouchableOpacity>

          <Separator borderColor="$gray5" />

          <TouchableOpacity onPress={handleSignOut}>
            <YStack px="$4" py="$3" flexDirection="row" alignItems="center">
              <View marginRight="$3">
                <LogOut size={24} color="#ff3b30" />
              </View>
              <Text fontSize={16} fontWeight="500" color="#ff3b30">
                Sign Out
              </Text>
            </YStack>
          </TouchableOpacity>
        </Card>

        {/* Version Info */}
        {authUser?.uid && (
          <UIDInfo uid={authUser.uid} version={`${appVersion}.patch`} />
        )}
    </Screen>
  );
}
