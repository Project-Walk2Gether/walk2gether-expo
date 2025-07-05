import React from 'react';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';
import { Clock } from '@tamagui/lucide-icons';
import { COLORS } from './constants';
import { Round } from 'walk2gether-shared';

interface Props {
  timeLeft: string;
  isRotating: boolean;
  onRotate: () => void;
  hasRounds: boolean;
}

export const RotationTimer = ({ timeLeft, isRotating, onRotate, hasRounds }: Props) => {
  return (
    <YStack 
      backgroundColor="$blue2" 
      padding="$4" 
      borderRadius="$4"
      marginBottom="$2"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" space="$2">
          <Clock size={18} color={COLORS.primary} />
          <Text>Rotate pairs in {timeLeft}</Text>
        </XStack>
        
        <Button
          backgroundColor="$blue8"
          color="white"
          onPress={onRotate}
          disabled={isRotating || !hasRounds}
          size="$3"
        >
          {isRotating ? <Spinner /> : "Rotate!"}
        </Button>
      </XStack>
    </YStack>
  );
};
