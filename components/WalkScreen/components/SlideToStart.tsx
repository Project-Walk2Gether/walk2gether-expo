import { Play, Square } from "@tamagui/lucide-icons";
import React from "react";
import { View } from "react-native";
import Slider from "react-native-slide-to-unlock";
import { Text } from "tamagui";

type Props = {
  onSlideComplete?: () => void;
  text?: string;
  backgroundColor?: string;
  iconColor?: string;
  icon?: "play" | "stop";
};

/**
 * SlideAction component - uses react-native-slide-to-unlock for a smooth sliding experience
 * with customizable text, colors, and icon
 */
const SlideAction: React.FC<Props> = ({
  onSlideComplete,
  text = "SLIDE TO START WALK",
  backgroundColor = "rgba(0,153,255,0.9)",
  iconColor = "#0099ff",
  icon = "play",
}) => {
  const SliderThumb = () => {
    const IconComponent = icon === "play" ? Play : Square;

    return (
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
        <IconComponent size={18} color={iconColor} />
      </View>
    );
  };

  return (
    <Slider
      onEndReached={() => onSlideComplete?.()}
      onSlideStart={() => {}}
      onSlideEnd={() => {}}
      containerStyle={{
        zIndex: -1,
        backgroundColor,
        borderRadius: 30,
        height: 43,
        paddingHorizontal: 5,
        overflow: "hidden",
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
        {text}
      </Text>
    </Slider>
  );
};

export default SlideAction;
