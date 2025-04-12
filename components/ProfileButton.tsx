import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "tamagui";
import { useUserData } from "../context/UserDataContext";

// Helper function to get initials from a name (up to two characters)
const getInitials = (name: string): string => {
  if (!name) return "U";
  
  const nameParts = name.split(' ');
  if (nameParts.length === 1) {
    // Just take the first character of the name
    return nameParts[0].charAt(0).toUpperCase();
  } else {
    // Take first character of first and last name
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }
};

export const ProfileButton = () => {
  const router = useRouter();
  const { userData } = useUserData();

  if (!userData) {
    return (
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push("/profile")}
      >
        <View style={styles.profilePlaceholder}>
          <Text style={styles.profileInitial}>U</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.profileButton}
      onPress={() => router.push("/profile")}
    >
      {userData.profilePicUrl ? (
        <Image
          source={{ uri: userData.profilePicUrl }}
          style={styles.profileImage}
        />
      ) : (
        <View style={styles.profilePlaceholder}>
          <Text style={styles.profileInitial}>
            {userData.name && userData.name.length > 0 
              ? getInitials(userData.name)
              : "U"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  adminButton: {
    backgroundColor: "#34A853",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  adminButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  profileButton: {
    marginRight: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profilePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555555",
  },
});
