import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Button } from "tamagui";

export default function HeaderBackButton({
  onPress,
  color = "#000",
}: {
  onPress?: () => void;
  color?: string;
}) {
  const router = useRouter();

  return (
    <Button
      chromeless
      onPress={onPress || (() => router.back())}
      circular
      icon={<ChevronLeft size={24} color={color} />}
    />
  );
}
