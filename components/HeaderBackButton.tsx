import { Ionicons } from "@expo/vector-icons";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Button } from "tamagui";

export default function HeaderBackButton({
  onPress,
}: {
  onPress?: () => void;
}) {
  const router = useRouter();

  return (
    <Button
      chromeless
      onPress={onPress || (() => router.back())}
      marginLeft={10}
      padding={0}
      icon={<ChevronLeft size={24} color="#000" />}
    />
  );
}
