import { Plus } from "@tamagui/lucide-icons";
import { Button, ButtonProps, Text, XStack } from "tamagui";

interface FABProps extends ButtonProps {
  text?: string;
  bottom?: number;
  right?: number;
}

export default function FAB({
  text,
  bottom = 32,
  right = 24,
  ...rest
}: FABProps) {
  return (
    <Button
      size="$6"
      backgroundColor="$primary"
      position="absolute"
      bottom={bottom}
      right={right}
      zIndex={100}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.15}
      shadowRadius={8}
      elevation={8}
      paddingHorizontal="$4"
      paddingVertical="$2"
      borderRadius={30}
      {...rest}
    >
      <XStack alignItems="center" space="$2">
        <Plus size={28} color="white" />
        {text && (
          <Text color="white" fontSize={18} fontWeight="600">
            {text}
          </Text>
        )}
      </XStack>
    </Button>
  );
}
