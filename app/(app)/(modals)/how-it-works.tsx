import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";

export default function HowItWorksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const handleGotIt = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={["#4EB1BA", "#6EDAA8", "#8BEBA0"]}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      <ScrollView
        flex={1}
        width="100%"
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: insets.top + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <YStack paddingHorizontal={20} alignItems="center">
          <Text
            fontSize={28}
            fontWeight="bold"
            marginBottom={10}
            color="white"
            textShadowColor="rgba(0, 0, 0, 0.4)"
            textShadowOffset={{ width: 2, height: 2 }}
            textShadowRadius={3}
          >
            Welcome to Walk2Gether!
          </Text>
          <Text
            fontSize={18}
            marginBottom={20}
            color="white"
            opacity={0.9}
            textShadowColor="rgba(0, 0, 0, 0.1)"
            textShadowOffset={{ width: 1, height: 1 }}
            textShadowRadius={1}
          >
            Here's how it works
          </Text>

          <Card
            width="100%"
            marginBottom={30}
            backgroundColor="white"
            borderRadius={15}
            padding={20}
            paddingTop={30}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.25}
            shadowRadius={3.84}
            elevation={5}
          >
            <XStack marginBottom={20}>
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="#4EB1BA"
                justifyContent="center"
                alignItems="center"
                marginRight={16}
              >
                <Text color="white" fontSize={18} fontWeight="bold">
                  1
                </Text>
              </YStack>
              <YStack flex={1}>
                <Text
                  fontSize={18}
                  fontWeight="bold"
                  marginBottom={8}
                  color="#333"
                >
                  Join a Walk
                </Text>
                <Text fontSize={16} lineHeight={22} color="#666">
                  Sign up for a scheduled walk in your area
                </Text>
              </YStack>
            </XStack>

            <XStack marginBottom={20}>
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="#4EB1BA"
                justifyContent="center"
                alignItems="center"
                marginRight={16}
              >
                <Text color="white" fontSize={18} fontWeight="bold">
                  2
                </Text>
              </YStack>
              <YStack flex={1}>
                <Text
                  fontSize={18}
                  fontWeight="bold"
                  marginBottom={8}
                  color="#333"
                >
                  Check In
                </Text>
                <Text fontSize={16} lineHeight={22} color="#666">
                  When you arrive, check in to confirm your participation and
                  get matched with your first walking buddy
                </Text>
              </YStack>
            </XStack>

            <XStack marginBottom={20}>
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="#4EB1BA"
                justifyContent="center"
                alignItems="center"
                marginRight={16}
              >
                <Text color="white" fontSize={18} fontWeight="bold">
                  3
                </Text>
              </YStack>
              <YStack flex={1}>
                <Text
                  fontSize={18}
                  fontWeight="bold"
                  marginBottom={8}
                  color="#333"
                >
                  Walk & Talk
                </Text>
                <Text fontSize={16} lineHeight={22} color="#666">
                  Enjoy a walk with your partner! After a while, we'll rotate
                  pairs, so you can get to know others on the walk
                </Text>
              </YStack>
            </XStack>
          </Card>

          <Button
            backgroundColor="white"
            paddingVertical={15}
            paddingHorizontal={40}
            borderRadius={10}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.25}
            shadowRadius={3.84}
            elevation={5}
            marginTop={10}
            onPress={handleGotIt}
          >
            <Text color="#4EB1BA" fontWeight="bold" fontSize={18}>
              Got It!
            </Text>
          </Button>
        </YStack>
      </ScrollView>
    </LinearGradient>
  );
}
