import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Button, Paragraph, Text, YStack } from "tamagui";

interface TokenSignInFormProps {
  token: string;
  onCancel: () => void;
}

export const TokenSignInForm: React.FC<TokenSignInFormProps> = ({
  token,
  onCancel,
}) => {
  const router = useRouter();
  const { signInWithToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateWithToken = async () => {
      if (!token) {
        setError("No token provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Attempt to sign in with the token
        const userCredential = await signInWithToken(token);

        // Check if the user has a profile
        const userDataDoc = db.collection("users").doc(userCredential.user.uid);
        const hasData = (await userDataDoc.get()).exists;

        if (!hasData) {
          router.replace("/onboarding/complete-your-profile");
        } else {
          router.replace("/");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
        setLoading(false);
      }
    };

    authenticateWithToken();
  }, [token, signInWithToken, router]);

  return (
    <YStack space="$4" paddingVertical="$4">
      {loading ? (
        <YStack alignItems="center" space="$4">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text fontSize="$4" textAlign="center">
            Authenticating...
          </Text>
        </YStack>
      ) : error ? (
        <YStack space="$4">
          <Paragraph color="$red10" textAlign="center">
            {error}
          </Paragraph>
          <Button onPress={onCancel} backgroundColor={COLORS.primary}>
            Go Back
          </Button>
        </YStack>
      ) : null}
    </YStack>
  );
};

export default TokenSignInForm;
