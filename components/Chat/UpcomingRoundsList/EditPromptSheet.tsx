import React, { forwardRef } from 'react';
import { Button, H4, Input, YStack } from 'tamagui';
import BottomSheet from '@gorhom/bottom-sheet';
import { COLORS } from './constants';

interface Props {
  promptText: string;
  setPromptText: (text: string) => void;
  onSave: () => void;
}

export const EditPromptSheet = forwardRef<BottomSheet, Props>(
  ({ promptText, setPromptText, onSave }, ref) => {
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={["40%"]}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: COLORS.text }}
        backgroundStyle={{ backgroundColor: COLORS.background }}
      >
        <YStack padding="$4" space="$4">
          <H4>Edit Question Prompt</H4>
          
          <Input
            value={promptText}
            onChangeText={setPromptText}
            placeholder="Enter a question for this round..."
            multiline
            numberOfLines={3}
            backgroundColor="white"
            borderWidth={1}
            borderColor="#e0e0e0"
            borderRadius="$4"
            paddingHorizontal="$3"
            paddingVertical="$2"
          />
          
          <Button
            backgroundColor="$blue8"
            color="white"
            onPress={onSave}
          >
            Save
          </Button>
        </YStack>
      </BottomSheet>
    );
  }
);
