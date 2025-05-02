import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Card, Spacer, Text, View, YStack } from "tamagui";
import { Slogan } from "../components/AnimatedLogo/Slogan";
import AnimatedLogo from "../components/AnimatedLogo/index";
import AuthScenicLayout from "../components/Auth/AuthScenicLayout";
import PhoneForm from "../components/Auth/Form/PhoneForm";
import TokenSignInForm from "../components/Auth/Form/TokenSignInForm";
import VerificationCodeForm, {
  VerificationSchema,
} from "../components/Auth/Form/VerificationCodeForm";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");
const logoWidth = width * 0.7;

export default function Auth() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { signInWithPhoneCredential } = useAuth();
  const [verificationId, setVerificationId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authMode, setAuthMode] = useState<"phone" | "token">("phone");

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
  
  // Check for token in URL params
  useEffect(() => {
    if (params.token) {
      setAuthMode("token");
    }
  }, [params.token]);

  return (
    <AuthScenicLayout
      showLogo={
        <YStack width="100%" alignItems="center">
          <Text
            color="rgb(182, 219, 99)"
            fontWeight="bold"
            textTransform="uppercase"
          >
            PROJECT
          </Text>
          <AnimatedLogo width={logoWidth} height={44} />
          <Spacer h="$1" />
          <Slogan delay={4500} />
        </YStack>
      }
      scroll
    >
      <YStack padding="$5" width="100%">
        <Card
          backgroundColor="white"
          borderRadius="$4"
          padding="$4"
          width="100%"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={3.84}
          elevation={5}
        >
          <Text fontSize={26} textAlign="center" color="#333" marginBottom="$2">
            {authMode === "token" 
              ? "Token Authentication" 
              : verificationId 
                ? "Enter confirmation code" 
                : "Get Started"}
          </Text>
          <View mb="$1">
            {authMode === "token" ? (
              <TokenSignInForm 
                token={params.token || ""}
                onCancel={() => {
                  setAuthMode("phone");
                  router.setParams({});
                }}
              />
            ) : verificationId ? (
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
