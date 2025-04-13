import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function HeaderCloseButton({
  onPress,
}: {
  onPress?: () => void;
}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={onPress || (() => router.back())}
      style={{ marginRight: 10 }}
    >
      <Ionicons name="close" size={24} color="#000" />
    </TouchableOpacity>
  );
}
