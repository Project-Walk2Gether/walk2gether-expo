import { StyleSheet } from "react-native";
import { Image, Text, View } from "tamagui";
import { UserData } from "walk2gether-shared";
import { useDoc } from "../utils/firestore";

export function UserAvatar({ uid }: { uid: string }) {
  const { doc: userData } = useDoc<UserData>(`users/${uid}`);

  if (!userData?.profilePicUrl) {
    return (
      <View style={styles.profilePlaceholder}>
        <Text style={styles.profileInitial}>
          {userData?.name ? userData.name.charAt(0).toUpperCase() : "..."}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: userData.profilePicUrl }}
      style={styles.profileImage}
    />
  );
}

const styles = StyleSheet.create({
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
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
