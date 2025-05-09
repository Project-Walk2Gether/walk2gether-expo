import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, XStack } from "tamagui";

interface Props {
  walkId: string;
  unapprovedCount: number;
}

export default function UnapprovedRequestsRow({
  walkId,
  unapprovedCount,
}: Props) {
  const router = useRouter();
  return (
    <XStack flexShrink={1} alignItems="center" gap={8} py={4}>
      <Text flexGrow={1} fontWeight="600" fontSize={13} color="#e67e22">
        {unapprovedCount}{" "}
        {unapprovedCount === 1 ? "person wants" : "people want"} to join
      </Text>
      <Button
        size="$2"
        backgroundColor="#e67e22"
        color="white"
        onPress={() => router.push(`/walks/${walkId}/waiting-room`)}
        borderRadius={8}
        px={12}
        py={4}
      >
        <Text color="white" fontWeight="bold" fontSize={13}>
          See requests
        </Text>
      </Button>
    </XStack>
  );
}
