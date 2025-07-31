import React from "react";
import { View } from "react-native";
import { YStack } from "tamagui";
import SlideAction from "./SlideToStart";

interface Props {
  onEndWalk: () => void;
}

/**
 * Component to handle the slide-to-end action for walks
 */
export const EndWalkSlider: React.FC<Props> = ({ onEndWalk }) => {
  return (
    <YStack paddingHorizontal="$4" paddingBottom="$2">
      <View style={{ width: "100%" }}>
        <SlideAction
          onSlideComplete={onEndWalk}
          text="SLIDE TO END WALK"
          backgroundColor="rgba(147,112,219,0.9)"
          iconColor="#9370DB"
          icon="stop"
        />
      </View>
    </YStack>
  );
};
