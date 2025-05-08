import { useUserData } from "@/context/UserDataContext";
import { useRouter } from "expo-router";
import { Image, TouchableOpacity } from "react-native";
import { Text, View } from "tamagui";

// Helper function to get initials from a name (up to two characters)
const getInitials = (name: string): string => {
  if (!name) return "U";

  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    // Just take the first character of the name
    return nameParts[0].charAt(0).toUpperCase();
  } else {
    // Take first character of first and last name
    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  }
};

export const ProfileButton = () => {
  const router = useRouter();
  const { userData } = useUserData();

  if (!userData) {
    return (
      <TouchableOpacity
        style={{ marginRight: 8 }}
        onPress={() => router.push("/profile")}
      >
        <View
          width={36}
          height={36}
          borderRadius={18}
          backgroundColor="#E0E0E0"
          justifyContent="center"
          alignItems="center"
          borderWidth={2}
          borderColor="#fff"
        >
          <Text fontSize={16} fontWeight="bold" color="#555555">
            U
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={{ marginRight: 8 }}
      onPress={() => router.push("/profile")}
    >
      {userData.profilePicUrl ? (
        <Image
          source={{ uri: userData.profilePicUrl }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 2,
            borderColor: "#fff",
          }}
        />
      ) : (
        <View
          width={36}
          height={36}
          borderRadius={18}
          backgroundColor="#E0E0E0"
          justifyContent="center"
          alignItems="center"
          borderWidth={2}
          borderColor="#fff"
        >
          <Text fontSize={16} fontWeight="bold" color="#555555">
            {userData.name && userData.name.length > 0
              ? getInitials(userData.name)
              : "U"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
