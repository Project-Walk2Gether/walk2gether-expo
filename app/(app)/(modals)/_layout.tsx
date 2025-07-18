import HeaderBackButton from "@/components/HeaderBackButton";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import Toast from "@/components/UI/Toast";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModalsLayout() {
  const content = (
    <>
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
          name="participant"
          options={{
            headerShown: true,
            headerLeft: () => <HeaderBackButton />,
          }}
        />
      </Stack>
      <Toast topOffset={66} />
    </>
  );

  return (
    <>
      {Platform.OS === "android" ? (
        <SafeAreaView style={{ flex: 1 }}>{content}</SafeAreaView>
      ) : (
        content
      )}
    </>
  );
}
