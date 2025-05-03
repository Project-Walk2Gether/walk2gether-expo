import { Stack } from "expo-router";
import HeaderBackButton from "../../../components/HeaderBackButton";

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
          headerLeft: () => <HeaderBackButton />,
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
