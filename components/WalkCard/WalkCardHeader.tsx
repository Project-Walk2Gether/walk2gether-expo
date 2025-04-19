import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";
import { COLORS } from "styles/colors";
import { Text, View, XStack } from "tamagui";
import WalkMenu from "../WalkMenu";

interface WalkCardHeaderProps {
  walkTypeData: any;
  walkIcon: React.ReactNode;
  isCreator: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
}

const WalkCardHeader: React.FC<WalkCardHeaderProps> = ({
  walkTypeData,
  walkIcon,
  isCreator,
  handleEdit,
  handleDelete,
}) => {
  return (
    <LinearGradient
      colors={walkTypeData.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
      }}
    >
      <View style={styles.bannerOverlay} pointerEvents="none" />
      <XStack
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        pl="$3"
        pr="$2"
        py="$3"
        gap="$2"
      >
        <XStack flexShrink={1} alignItems="center" gap="$1">
          <XStack flexShrink={1} alignItems="center" gap="$2">
            {walkIcon}
            <Text
              flexShrink={1}
              flexGrow={1}
              color="white"
              fontWeight="bold"
              fontSize={14}
            >
              {walkTypeData.label}
            </Text>
          </XStack>

          <XStack
            backgroundColor="white"
            borderRadius={99}
            px={12}
            py={5}
            alignItems="center"
            justifyContent="center"
            minWidth={0}
          >
            <Text fontSize={12} fontWeight="bold" color={COLORS.text}>
              Happening now!
            </Text>
          </XStack>
        </XStack>
        {isCreator && <WalkMenu onEdit={handleEdit} onDelete={handleDelete} />}
      </XStack>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
});

export default WalkCardHeader;
