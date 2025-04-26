import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import { appVersion } from "utils/version";

export default function BottomRow() {
  const insets = useSafeAreaInsets();

  return (
    <YStack
      position="absolute"
      bottom={insets.bottom - 10}
      left={0}
      width="100%"
      zIndex={100}
    >
      <Text fontSize={10} textAlign="center" color="#444" width="100%">
        {"Version: " + appVersion}
      </Text>
    </YStack>
  );
}
