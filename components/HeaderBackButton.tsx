import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
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
      circular
      icon={<ChevronLeft size={24} color="#000" />}
    />
  );
}
