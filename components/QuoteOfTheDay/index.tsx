import { useQuoteOfTheDay } from "@/utils/quotes";
import { Quote } from "@tamagui/lucide-icons";
import React from "react";
import { ActivityIndicator } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";

export default function QuoteOfTheDay() {
  const { quote, loading } = useQuoteOfTheDay();

  if (loading) {
    return (
      <Card
        elevate
        backgroundColor="rgba(255, 255, 255, 0.7)"
        padding="$4"
        marginVertical="$4"
        borderRadius={16}
      >
        <XStack justifyContent="center" paddingVertical="$2">
          <ActivityIndicator size="small" />
        </XStack>
      </Card>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <Card
      elevate
      backgroundColor="rgba(255, 255, 255, 0.7)"
      padding="$4"
      marginVertical="$4"
      borderRadius={16}
      shadowColor="#000"
      shadowOpacity={0.05}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 2 }}
    >
      <XStack alignItems="center" gap="$2" marginBottom="$2">
        <Quote size={20} color="#6d4c2b" />
        <Text fontSize={18} fontWeight="bold" color="#6d4c2b">
          Quote of the Day
        </Text>
      </XStack>

      <YStack gap="$2">
        <Text fontSize={17} fontStyle="italic" color="#444" lineHeight={24}>
          "{quote.text}"
        </Text>

        {quote.author && (
          <Text fontSize={15} color="#666" alignSelf="flex-end">
            — {quote.author}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
