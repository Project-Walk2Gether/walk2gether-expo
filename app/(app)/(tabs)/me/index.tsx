import EditButton from "@/components/EditButton";
import { Screen } from "@/components/UI";
import ActionRow from "@/components/UI/ActionRow";
import { PlaceData } from "@/components/UI/PlacesAutocomplete";
import { StatelessAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useMenu } from "@/context/MenuContext";
import { useUpdates } from "@/context/UpdatesContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { appVersion } from "@/utils/version";
import storage from "@react-native-firebase/storage";
import {
  AlertTriangle,
  Bell,
  Camera,
  Clock,
  Download,
  Info,
  LogOut,
  Phone,
  QrCode,
  Trash,
} from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import {
  Button,
  Card,
  H4,
  Separator,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";

export default function MeScreen() {
  const { user: authUser, signOut } = useAuth();
  const { userData, loading: userDataLoading, updateUserData } = useUserData();
  const {
    isUpdateAvailable,
    applyUpdate,
    checkForUpdate,
    isCheckingForUpdate,
  } = useUpdates();
  const { showMenu } = useMenu();
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

      // Update user profile with the new picture URL
      await updateUserData({ profilePicUrl: downloadURL });

      // Update local state
      setProfilePicUrl(downloadURL);

      showMessage("Profile picture updated", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showMessage("Failed to upload image", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Router will handle navigation to auth screen
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Check for updates when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkForUpdate();
    }, [])
  );

  if (userDataLoading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </Screen>
    );
  }

  return (
    <Screen title="" useTopInsets gradientVariant="main">
      <YStack mt="$4" mb="$5" alignItems="center">
        <Pressable
          onPress={() => {
            showMenu("Profile Picture", [
              {
                label: "Change Picture",
                icon: <Camera size={24} color={COLORS.primary} />,
                onPress: handlePickImage,
                theme: "blue",
              },
              {
                label: "Remove Picture",
                icon: <Trash size={24} color="#ff3b30" />,
                onPress: handleRemoveImage,
                theme: "red",
              },
            ]);
          }}
        >
          <StatelessAvatar
            profilePicUrl={profilePicUrl}
            name={name}
            size={120}
            borderWidth={3}
            backgroundColor={COLORS.primary}
          />
        </Pressable>
        <H4 mt="$3" mb="$1" fontSize={26} fontWeight="bold">
          {name || "Your Name"}
        </H4>
      </YStack>

      {/* About Me Section */}
      <Card
        onPress={handleEditProfile}
        backgroundColor="white"
        mb="$3"
        px="$2"
        py="$2"
        borderRadius={16}
        position="relative"
      >
        <YStack px="$4" py="$3">
          {location && (
            <>
              <Text
                fontSize={16}
                fontWeight="bold"
                color={COLORS.primary}
                mb="$2"
              >
                My location
              </Text>
              <Text fontSize={16} opacity={0.9} mb="$3">
                {location.name}
              </Text>
            </>
          )}
          <Text fontWeight="bold" fontSize="$4" color={COLORS.primary} mb="$2">
            About me
          </Text>
          <Text fontSize={16} color={COLORS.text} opacity={aboutMe ? 1 : 0.7}>
            {aboutMe || "Add some details about yourself..."}
          </Text>
        </YStack>
        <EditButton
          backgroundColor="#888888"
          onPress={handleEditProfile}
          size={32}
          position="absolute"
          right={-6}
          top={-6}
        />
      </Card>

      {/* Actions Section */}
      <Card backgroundColor="white" mb="$3" borderRadius={16}>
        <ActionRow
          icon={<QrCode />}
          label="My QR Code"
          onPress={() => router.push("/qr-code")}
        />

        <Separator borderColor="$gray5" />

        <ActionRow
          icon={<Clock />}
          label="My Walk History"
          onPress={() => router.push("/me/history")}
        />

        <Separator borderColor="$gray5" />

        <ActionRow
          icon={<Bell />}
          label="Notification Settings"
          onPress={() => router.push("/me/notifications")}
        />

        <Separator borderColor="$gray5" />

        <ActionRow
          icon={<Phone />}
          title="Phone"
          secondaryText={authUser?.phoneNumber || "Not provided"}
        />

        <Separator borderColor="$gray5" />

        <ActionRow
          icon={
            isCheckingForUpdate ? (
              <Spinner
                size="small"
                color={isUpdateAvailable ? "white" : COLORS.primary}
              />
            ) : (
              <Info
                size={24}
                color={isUpdateAvailable ? "white" : COLORS.textSecondary}
              />
            )
          }
          title="Version"
          secondaryText={appVersion}
          onPress={isUpdateAvailable ? applyUpdate : undefined}
          action={
            isUpdateAvailable ? (
              <XStack alignItems="center" space="$2">
                <Download size={16} color="white" />
                <Text color="white" fontWeight="500">
                  Tap to instant-update
                </Text>
              </XStack>
            ) : undefined
          }
          backgroundColor={isUpdateAvailable ? COLORS.info : undefined}
          titleColor={isUpdateAvailable ? "white" : undefined}
          secondaryTextColor={isUpdateAvailable ? "white" : undefined}
        />

        <Separator borderColor="$gray5" />

        <ActionRow
          icon={<LogOut color={COLORS.error} />}
          label="Sign Out"
          onPress={handleSignOut}
          isLast={true}
        />
      </Card>

      <YStack mt={100}>
        <Button
          size="$4"
          color="#DC2626"
          icon={<AlertTriangle size={20} color="#DC2626" />}
          onPress={() => router.push("/me/delete-account")}
          fontWeight="600"
        >
          Delete My Account
        </Button>
      </YStack>
    </Screen>
  );
}
