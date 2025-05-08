import HeaderBackButton from "@/components/HeaderBackButton";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
      }}
    >
      <Stack.Screen
        name="invite-friends"
        options={{
          title: "Invite Friends",
          headerShown: true,
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <Stack.Screen
        name="review-participant"
        options={{
          title: "Review Participant",
          headerShown: true,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
