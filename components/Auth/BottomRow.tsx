import { Text, YStack } from "tamagui";
import { appVersion } from "../../utils/version";

export default function BottomRow() {
  return (
    <YStack position="absolute" bottom={20} left={0} width="100%" zIndex={100}>
      <Text fontSize={12} textAlign="center" color="#444" width="100%">
        {"Version: " + appVersion}
      </Text>
    </YStack>
  );
}
