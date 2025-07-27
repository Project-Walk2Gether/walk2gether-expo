import React from "react";
import { View } from "react-native";
import { YStack } from "tamagui";
import SlideAction from "./SlideToStart";

interface Props {
  showStartWalkSlider: boolean;
  showEndWalkSlider: boolean;
  onStartWalk: () => void;
  onEndWalk: () => void;
}

/**
 * Component to handle the slide-to-start and slide-to-end actions for walks
 */
export const WalkActionSliders: React.FC<Props> = ({
  showStartWalkSlider,
  showEndWalkSlider,
  onStartWalk,
  onEndWalk,
}) => {
  if (!showStartWalkSlider && !showEndWalkSlider) {
    return null;
  }

  return (
    <YStack
      position="absolute"
      bottom={"$4"}
      left={"$4"}
      right={"$4"}
      zIndex={100}
    >
      <View style={{ width: "100%" }}>
        {showStartWalkSlider && (
          <SlideAction
            onSlideComplete={onStartWalk}
            text="SLIDE TO START WALK"
            backgroundColor="rgba(0,153,255,0.9)"
            iconColor="#0099ff"
            icon="play"
          />
        )}

        {showEndWalkSlider && (
          <SlideAction
            onSlideComplete={onEndWalk}
            text="SLIDE TO END WALK"
            backgroundColor="rgba(147,112,219,0.9)"
            iconColor="#9370DB"
            icon="stop"
          />
        )}
      </View>
    </YStack>
  );
};
