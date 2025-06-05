import { useQuoteOfTheDay } from "@/utils/quotes";
import { Quote as QuoteIcon } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface Props {
  imageSize?: number;
  skipAnimation?: boolean;
}

export default function QuoteWithImage({ imageSize = 200, skipAnimation = false }: Props) {
  // Fetch the quote using our custom hook
  const { quote } = useQuoteOfTheDay();
  // Animation state
  const [showElements, setShowElements] = useState(skipAnimation);

  // Delay animation start by 1 second if animation isn't skipped
  useEffect(() => {
    if (skipAnimation) {
      setShowElements(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setShowElements(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [skipAnimation]);

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
      {/* Removed Card component and elevation for a more subtle appearance */}
      <YStack padding="$3" marginVertical="$2" opacity={0.9} gap="$3">
        <XStack
          alignItems="center"
          justifyContent="flex-start"
          marginBottom="$1"
        >
          <QuoteIcon size={18} color="rgba(109, 76, 43, 0.7)" />
        </XStack>
        <Text
          fontSize={16}
          fontStyle="italic"
          fontWeight="400"
          color="rgba(0, 0, 0, 0.8)"
          lineHeight={24}
          textAlign="center"
        >
          "{quote.text}"
        </Text>

        {quote.author && (
          <Text
            fontSize={14}
            color="rgba(30, 30, 30, 0.8)"
            alignSelf="flex-end"
            fontWeight="400"
          >
            — {quote.author}
          </Text>
        )}
      </YStack>

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
