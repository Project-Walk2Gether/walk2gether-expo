import FullScreenLoader from "@/components/FullScreenLoader";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import LocationSelection from "@/components/WalkWizard/sections/LocationSelection";
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
function EditLocationSelectionWrapper({ onSave, onBack }: { onSave: (formData: any) => Promise<void>; onBack: () => void }) {
  const { formData } = useWalkForm();
  
  const handleContinue = useCallback(() => {
    onSave(formData);
  }, [onSave, formData]);
  
  return (
    <LocationSelection
      onContinue={handleContinue}
      onBack={onBack}
    />
  );
}

export default function EditWalkLocationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<WithId<Walk>>(`walks/${id}`);
  const { showMessage } = useFlashMessage();

  // Handle saving the location changes
  const handleSave = useCallback(async (formData: any) => {
    if (!walk) return;

    try {
      const walkRef = doc(db, "walks", walk.id!);
      
      await updateDoc(walkRef, {
        startLocation: formData.startLocation,
      });

      showMessage("Walk location updated successfully!", "success");
      router.back();
    } catch (error) {
      console.error("Error updating walk location:", error);
      Alert.alert("Error", "Failed to update walk location. Please try again.");
    }
  }, [walk, showMessage, router]);

  if (!walk) return <FullScreenLoader />;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Walk Location",
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
            <EditLocationSelectionWrapper onSave={handleSave} onBack={() => router.back()} />
          </WalkFormProvider>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
