import React from "react";
import { YStack } from "tamagui";
import SlideAction from "../SlideToStart";

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
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={1}
    >
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
          backgroundColor="rgba(255,59,48,0.9)"
          iconColor="#FF3B30"
          icon="stop"
        />
      )}
    </YStack>
  );
};
