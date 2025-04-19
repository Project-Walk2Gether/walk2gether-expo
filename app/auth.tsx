import AuthScenicLayout from "components/Auth/AuthScenicLayout";
import PhoneForm from "components/Auth/Form/PhoneForm";
import VerificationCodeForm, {
  VerificationSchema,
} from "components/Auth/Form/VerificationCodeForm";
import { db } from "config/firebase";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, ScrollView, Text, YStack } from "tamagui";
import AnimatedLogo from "../components/AnimatedLogo";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signInWithPhoneCredential } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [verificationId, setVerificationId] = useState("");

  const handleVerificationCodeFormSubmit = async (
    values: VerificationSchema
  ) => {
    const userCredential = await signInWithPhoneCredential(
      verificationId,
      values.verificationCode
    );
    // Now, check if the user has a profile
    const userDataDoc = db.collection("users").doc(userCredential.user.uid);

    const hasData = (await userDataDoc.get()).exists;
    if (!hasData) {
      router.replace("/onboarding/complete-your-profile");
    } else {
      router.replace("/");
    }
  };

  return (
    <AuthScenicLayout
      showLogo={
        <YStack width="100%" gap="$2" alignItems="center">
          <Text
            color="rgb(42, 107, 84)"
            fontWeight="bold"
            position="relative"
            top={12}
            textTransform="uppercase"
          >
            PROJECT
          </Text>
          <AnimatedLogo width={240} height={80} />
        </YStack>
      }
      scroll
    >
      <YStack padding="$5" width="100%">
        <Card
          backgroundColor="white"
          borderRadius="$4"
          padding="$5"
          paddingTop="$4"
          width="100%"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={3.84}
          elevation={5}
        >
          <Text
            fontSize="$5"
            fontWeight="bold"
            textAlign="center"
            color="#333"
            marginBottom="$5"
          >
            Get started
          </Text>
          {verificationId ? (
            <VerificationCodeForm
              goBack={() => setVerificationId("")}
              handleSubmit={handleVerificationCodeFormSubmit}
            />
          ) : (
            <PhoneForm setVerificationCode={setVerificationId} />
          )}
        </Card>
      </YStack>
    </AuthScenicLayout>
  );
}

const styles = StyleSheet.create({
  // Only keep styles that are needed for third-party components or RN components that weren't converted to Tamagui
  placesInputContainer: {
    borderWidth: 0,
  },
  placesInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  placesList: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "white",
    marginTop: 5,
  },
  placesRow: {
    padding: 13,
    height: 50,
  },
  placesDescription: {
    fontSize: 14,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
});

// Helper function to determine top padding based on screen height and auth mode
const getTopPadding = (screenHeight: number): number => {
  const isLargeScreen = screenHeight > 700; // Arbitrary threshold for large screen

  return isLargeScreen ? 160 : 80;
};
