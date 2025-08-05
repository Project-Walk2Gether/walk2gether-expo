import FullScreenLoader from "@/components/FullScreenLoader";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import DurationSelection from "@/components/WalkWizard/sections/DurationSelection";
import { db } from "@/config/firebase";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { WalkFormProvider, useWalkForm } from "@/context/WalkFormContext";
import { useDoc } from "@/utils/firestore";
import { doc, updateDoc } from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Alert } from "react-native";
import { Walk, WithId } from "walk2gether-shared";

// Wrapper component to handle the onContinue callback with form data
function EditDurationSelectionWrapper({
  onSave,
  onBack,
}: {
  onSave: (formData: any) => Promise<void>;
  onBack: () => void;
}) {
  const { formData } = useWalkForm();
  const router = useRouter();

  const handleContinue = useCallback(() => {
    onSave(formData);
    router.back();
  }, [onSave, formData]);

  return <DurationSelection onContinue={handleContinue} onBack={onBack} />;
}

export default function EditWalkDurationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<WithId<Walk>>(`walks/${id}`);
  const { showMessage } = useFlashMessage();

  // Handle saving the duration changes
  const handleSave = useCallback(
    async (formData: any) => {
      if (!walk) return;

      try {
        const walkRef = doc(db, "walks", walk.id!);

        await updateDoc(walkRef, {
          durationMinutes: formData.durationMinutes,
        });

        showMessage("Walk duration updated successfully!", "success");
        router.back();
      } catch (error) {
        console.error("Error updating walk duration:", error);
        Alert.alert(
          "Error",
          "Failed to update walk duration. Please try again."
        );
      }
    },
    [walk, showMessage, router]
  );

  if (!walk) return <FullScreenLoader />;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Walk Duration",
          headerRight: () => <HeaderCloseButton />,
        }}
      />

      <WalkFormProvider existingWalk={walk} onSubmit={handleSave}>
        <EditDurationSelectionWrapper
          onSave={handleSave}
          onBack={() => router.back()}
        />
      </WalkFormProvider>
    </>
  );
}
