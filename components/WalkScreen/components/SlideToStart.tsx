import { Play } from "@tamagui/lucide-icons";
import React from "react";
import { View } from "react-native";
import Slider from "react-native-slide-to-unlock";
import { Text } from "tamagui";

interface SlideToStartProps {
  onSlideComplete: () => void;
}

/**
 * SlideToStart component - uses react-native-slide-to-unlock for a smooth sliding experience
 */
const SlideToStart: React.FC<SlideToStartProps> = ({ onSlideComplete }) => {
  const SliderThumb = () => (
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 20,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Play size={18} color="#0099ff" />
    </View>
  );

  return (
    <Slider
      onEndReached={onSlideComplete}
      onSlideStart={() => {}}
      onSlideEnd={() => {}}
      containerStyle={{
        position: "absolute",
        top: 5,
        left: 5,
        right: 5,
        bottom: 5,
        backgroundColor: "rgba(0,153,255,0.9)",
        borderRadius: 30,
        overflow: "hidden",
        zIndex: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
      sliderElement={<SliderThumb />}
      childrenContainer={{
        backgroundColor: "transparent",
        justifyContent: "center",
      }}
    >
      <Text color="white" fontWeight="bold" textAlign="center">
        SLIDE TO START WALK
      </Text>
    </Slider>
  );
};

export default SlideToStart;
