import { COLORS } from "@/styles/colors";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlaceData, PlacesAutocomplete } from "../../../components/UI";
import { useAuth } from "../../../context/AuthContext";
import { useUserData } from "../../../context/UserDataContext";
import { appVersion } from "../../../utils/version";

export default function ProfileScreen() {
  const { user: authUser, refreshToken, signOut } = useAuth();
  const {
    userData,
    loading: userDataLoading,
    updateUserData,
    refreshUserData,
  } = useUserData();
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

  // Function to handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // First refresh the token
      await refreshToken();

      // Then refresh user data
      await refreshUserData();
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshToken, refreshUserData]);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to make this work!"
        );
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
        const selectedImage = result.assets[0];
        await uploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showMessage({
        message: "Error",
        description: "Failed to pick image",
        type: "danger",
      });
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.action} />
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.profileImageContainer}>
        {profilePicUrl ? (
          <Image source={{ uri: profilePicUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>
              {name ? name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.changePhotoButton}
          onPress={pickImage}
          disabled={isSaving}
        >
          <Text style={styles.changePhotoButtonText}>
            {profilePicUrl ? "Change Photo" : "Add Photo"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />

        <PlacesAutocomplete
          value={location}
          onSelect={(newLocation) => setLocation(newLocation)}
          placeholder="Enter your location"
          label="Location"
          googleApiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        />

        <Text style={styles.label}>Email</Text>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={isSaving}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version: {appVersion}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.action,
  },
  changePhotoButton: {
    marginTop: 5,
  },
  changePhotoButtonText: {
    color: COLORS.action,
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: COLORS.TEXT_LABEL,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  emailText: {
    fontSize: 16,
    marginBottom: 20,
    color: COLORS.TEXT_ON_LIGHT,
  },
  saveButton: {
    backgroundColor: COLORS.action,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  saveButtonText: {
    color: COLORS.textOnDark,
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: "#ff3b30",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  signOutButtonText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "600",
  },
  versionContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    color: COLORS.TEXT_LABEL,
    opacity: 0.7,
  },
});
