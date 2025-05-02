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
        name="edit-walk/[id]"
        options={{
          title: "Edit walk",
          headerShown: true,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="walk/[id]"
        options={{
          title: "Let's walk",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
