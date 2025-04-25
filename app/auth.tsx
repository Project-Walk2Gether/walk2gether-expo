import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Card, Text, View, YStack } from "tamagui";
import AnimatedLogo from "../components/AnimatedLogo";
import AuthScenicLayout from "../components/Auth/AuthScenicLayout";
import PhoneForm from "../components/Auth/Form/PhoneForm";
import VerificationCodeForm, {
  VerificationSchema,
} from "../components/Auth/Form/VerificationCodeForm";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const router = useRouter();
  const { signInWithPhoneCredential } = useAuth();
  const [verificationId, setVerificationId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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
          <Text fontSize={24} textAlign="center" color="#333" marginBottom="$3">
            {verificationId ? "Enter confirmation code" : "Get started"}
          </Text>
          <View mb="$4">
            {verificationId ? (
              <VerificationCodeForm
                goBack={() => setVerificationId("")}
                handleSubmit={handleVerificationCodeFormSubmit}
                phoneNumber={phoneNumber}
              />
            ) : (
              <PhoneForm
                onPhoneVerified={(id, phone) => {
                  setVerificationId(id);
                  setPhoneNumber(phone);
                }}
              />
            )}
          </View>
        </Card>
      </YStack>
    </AuthScenicLayout>
  );
}
