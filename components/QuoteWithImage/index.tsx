import { useQuoteOfTheDay } from "@/utils/quotes";
import { Quote as QuoteIcon } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";

interface Props {
  imageSize?: number;
}

export default function QuoteWithImage({ imageSize = 120 }: Props) {
  // Fetch the quote using our custom hook
  const { quote } = useQuoteOfTheDay();
  // Animation state
  const [showElements, setShowElements] = useState(false);

  // Delay animation start by 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowElements(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!quote) {
    return null;
  }

  return (
    <YStack
      gap="$2"
      animation={showElements ? "bouncy" : undefined}
      opacity={showElements ? 1 : 0}
      scale={showElements ? 1 : 0.9}
      enterStyle={{ opacity: 0, scale: 0.9 }}
      exitStyle={{ opacity: 0, scale: 0.9 }}
    >
      <Card
        elevate
        backgroundColor="rgba(255, 255, 255, 0.9)"
        padding="$4"
        marginVertical="$2"
        borderRadius={20}
        shadowColor="#000"
        shadowOpacity={0.1}
        shadowRadius={10}
        shadowOffset={{ width: 0, height: 3 }}
        borderColor="$borderColorFocus"
        borderWidth={1}
      >
        <YStack gap="$3">
          <XStack
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="$2"
          >
            <QuoteIcon size={22} color="#6d4c2b" />
          </XStack>
          <Text
            fontSize={18}
            fontStyle="italic"
            fontWeight="500"
            color="#444"
            lineHeight={26}
            textAlign="center"
          >
            "{quote.text}"
          </Text>

          {quote.author && (
            <Text
              fontSize={16}
              color="#666"
              alignSelf="flex-end"
              fontWeight="500"
            >
              — {quote.author}
            </Text>
          )}
        </YStack>
      </Card>

      <YStack
        animation="bouncy"
        enterStyle={{ opacity: 0, y: 10, scale: 0.9 }}
        y={0}
        opacity={1}
        scale={1}
      >
        <Image
          source={require("@/assets/thumbs.png")}
          accessibilityLabel="Thumbs up"
          resizeMode="contain"
          style={{
            width: imageSize,
            height: imageSize,
          }}
        />
      </YStack>
    </YStack>
  );
}
