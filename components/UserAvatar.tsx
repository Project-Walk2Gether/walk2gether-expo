import { Avatar, Image, Text, View } from "tamagui";
import { UserData } from "walk2gether-shared";
import { useDoc } from "../utils/firestore";

export function UserAvatar({ uid }: { uid: string }) {
  const { doc: userData } = useDoc<UserData>(`users/${uid}`);

  if (!userData?.profilePicUrl) {
    return (
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
        <Text>
          {userData?.name ? userData.name.charAt(0).toUpperCase() : "..."}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: userData.profilePicUrl }}
      width={36}
      height={36}
      borderRadius={18}
      borderWidth={2}
      borderColor="#fff"
    />
  );
}

