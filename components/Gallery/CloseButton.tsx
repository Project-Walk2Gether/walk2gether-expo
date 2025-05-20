import { X } from "@tamagui/lucide-icons";
import { Button } from "tamagui";

interface Props {
  onPress: () => void;
  top?: number;
  right?: number;
}

/**
 * A reusable close button component for modal screens
 */
export function CloseButton({ onPress, top = 60, right = 20 }: Props) {
  return (
    <Button
      position="absolute"
      top={top}
      right={right}
      size="$5"
      circular
      zIndex={1000}
      backgroundColor="rgba(0,0,0,0.5)"
      onPress={onPress}
      icon={<X color="white" size="$2" />}
    />
  );
}
