import { Dimensions } from "react-native";
import { Image, View } from "tamagui";
import { CloseButton } from "./CloseButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  imageUri: string;
  onClose: () => void;
}

/**
 * A full screen image display component with close button
 */
export function FullScreenImage({ imageUri, onClose }: Props) {
  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="black"
      justifyContent="center"
      alignItems="center"
      zIndex={1000}
    >
      <CloseButton onPress={onClose} />
      
      <Image
        source={{ uri: imageUri }}
        width="100%"
        height="90%"
        resizeMode="contain"
      />
    </View>
  );
}
