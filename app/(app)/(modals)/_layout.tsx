import HeaderBackButton from "@/components/HeaderBackButton";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import Toast from "@/components/UI/Toast";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModalsLayout() {
  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
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
              headerShown: true,
              title: "Review walker",
              headerLeft: () => <HeaderBackButton />,
            }}
          />
        </Stack>
        <Toast topOffset={66} />
      </SafeAreaView>
    </>
  );
}
