import { useRouter } from "expo-router";
import { Button, Text, View } from "tamagui";

interface Props {
  pendingRequests: number;
  id: string;
}

export default function WaitingRoomButton({ pendingRequests, id }: Props) {
  const router = useRouter();

  return (
    <View>
      <Button
        chromeless
        size="$2"
        onPress={() => router.push(`/walks/${id}/waiting-room`)}
        marginLeft={8}
      >
        Want to join
        {pendingRequests > 0 && (
          <View
            position="absolute"
            top={-6}
            right={-6}
            width={20}
            height={20}
            borderRadius={10}
            bg="red"
            jc="center"
            ai="center"
            zIndex={1}
          >
            <Text color="white" fontSize={12} fontWeight="bold">
              {pendingRequests}
            </Text>
          </View>
        )}
      </Button>
    </View>
  );
}
