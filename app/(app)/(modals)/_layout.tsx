import HeaderBackButton from "@/components/HeaderBackButton";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import Toast from "@/components/UI/Toast";
import { PortalHostProvider } from "@/context/PortalHostContext";
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
          name="invite"
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
        <Stack.Screen
          name="meetup-photo-viewer"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <Toast topOffset={66} />
    </>
  );

  return (
    <PortalHostProvider portalHostName="modal-sheet">
      {Platform.OS === "android" ? (
        <SafeAreaView style={{ flex: 1 }}>{content}</SafeAreaView>
      ) : (
        content
      )}
    </PortalHostProvider>
  );
}
