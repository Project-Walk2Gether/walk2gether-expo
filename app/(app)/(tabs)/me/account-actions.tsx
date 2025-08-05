import { Screen } from "@/components/UI";
import ActionRow from "@/components/UI/ActionRow";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { MenuItem, useMenu } from "@/context/MenuContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { AlertTriangle, Map } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Card, Separator } from "tamagui";

export default function AccountActionsScreen() {
  const router = useRouter();
  const { userData, updateUserData } = useUserData();
  const { showMenu } = useMenu();
  const { showMessage } = useFlashMessage();

  return (
    <Screen title="Account Actions" useTopInsets gradientVariant="main">
      <Card backgroundColor="white" mx={20} mt="$4" borderRadius={16}>
        <ActionRow
          icon={<Map />}
          label="Distance Unit"
          secondaryText={
            userData?.distanceUnit === "mi" ? "Miles" : "Kilometers"
          }
          onPress={() => {
            const menuItems: MenuItem[] = [
              {
                label: "Kilometers",
                onPress: () => {
                  updateUserData({ distanceUnit: "km" });
                  showMessage(
                    "Distance unit changed to kilometers",
                    "success"
                  );
                },
                theme: userData?.distanceUnit === "km" ? "blue" : "default",
              },
              {
                label: "Miles",
                onPress: () => {
                  updateUserData({ distanceUnit: "mi" });
                  showMessage("Distance unit changed to miles", "success");
                },
                theme: userData?.distanceUnit === "mi" ? "blue" : "default",
              },
            ];
            showMenu("Select Distance Unit", menuItems);
          }}
        />

        <Separator borderColor="$gray5" />

        <ActionRow
          icon={<AlertTriangle color={COLORS.error} />}
          label="Delete My Account"
          secondaryText="Permanently delete your account and all data"
          onPress={() => router.push("/me/delete-account")}
          isLast={true}
        />
      </Card>
    </Screen>
  );
}
