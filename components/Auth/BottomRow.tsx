import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import { appVersion } from "utils/version";

export default function BottomRow() {
  const insets = useSafeAreaInsets();

  return (
    <YStack
      position="absolute"
      bottom={insets.bottom + 20}
      left={0}
      width="100%"
      zIndex={-1}
    >
      <Text
        fontSize="$4"
        fontWeight="bold"
        textAlign="center"
        color="rgb(60 42 24)"
        opacity={0.9}
      >
        Walk. Connect. Community.
      </Text>
      <Text textAlign="center" color="#999" width="100%">
        {"Version: " + appVersion}
      </Text>
    </YStack>
  );
}
