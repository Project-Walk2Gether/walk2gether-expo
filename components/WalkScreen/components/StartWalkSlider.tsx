import React from "react";
import { View } from "react-native";
import { YStack } from "tamagui";
import SlideAction from "./SlideToStart";

interface Props {
  onStartWalk: () => void;
}

/**
 * Component to handle the slide-to-start action for walks
 */
export const StartWalkSlider: React.FC<Props> = ({ onStartWalk }) => {
  return (
    <YStack
      position="absolute"
      bottom={"$4"}
      left={"$4"}
      right={"$4"}
      zIndex={100}
    >
      <View style={{ width: "100%" }}>
        <SlideAction
          onSlideComplete={onStartWalk}
          text="SLIDE TO START WALK"
          backgroundColor="rgba(0,153,255,0.9)"
          iconColor="#0099ff"
          icon="play"
        />
      </View>
    </YStack>
  );
};
