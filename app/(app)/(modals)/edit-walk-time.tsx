import FullScreenLoader from "@/components/FullScreenLoader";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import TimeSelection from "@/components/WalkWizard/sections/TimeSelection";
import { db } from "@/config/firebase";
import { WalkFormProvider, useWalkForm } from "@/context/WalkFormContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useDoc } from "@/utils/firestore";
import { doc, updateDoc } from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";

// Wrapper component to handle the onContinue callback with form data
function EditTimeSelectionWrapper({ onSave, onBack }: { onSave: (formData: any) => Promise<void>; onBack: () => void }) {
  const { formData } = useWalkForm();
  
  const handleContinue = useCallback(() => {
    onSave(formData);
  }, [onSave, formData]);
  
  return (
    <TimeSelection
      onContinue={handleContinue}
      onBack={onBack}
    />
  );
}

export default function EditWalkTimeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<WithId<Walk>>(`walks/${id}`);
  const { showMessage } = useFlashMessage();

  // Handle saving the time changes
  const handleSave = useCallback(async (formData: any) => {
    if (!walk) return;

    try {
      const walkRef = doc(db, "walks", walk.id!);
      
      await updateDoc(walkRef, {
        date: formData.date, // formData.date is already a Timestamp from TimeSelection
      });

      showMessage("Walk time updated successfully!", "success");
      router.back();
    } catch (error) {
      console.error("Error updating walk time:", error);
      Alert.alert("Error", "Failed to update walk time. Please try again.");
    }
  }, [walk, showMessage, router]);

  if (!walk) return <FullScreenLoader />;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Walk Time",
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          flex={1}
          backgroundColor="#f5f5f5"
          keyboardShouldPersistTaps="handled"
        >
          <WalkFormProvider existingWalk={walk} onSubmit={handleSave}>
            <EditTimeSelectionWrapper onSave={handleSave} onBack={() => router.back()} />
          </WalkFormProvider>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
