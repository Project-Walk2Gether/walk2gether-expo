import React from "react";
import { Pressable } from "react-native";
import { Text, View } from "tamagui";
import useDynamicRefs from "use-dynamic-refs";

interface Props {
  badge?: string | number;
  onPress: () => void;
  testID?: string;
  isActive: boolean;
  IconComponent: React.ComponentType<any>; // Allow any icon component type
  label: string;
  tourRefName?: string;
}

const BottomTabItem: React.FC<Props> = ({
  onPress,
  badge,
  testID,
  isActive,
  label,
  IconComponent,
  tourRefName,
}) => {
  const [, setRef] = useDynamicRefs();
  const color = isActive ? "$blue9" : "$gray9";

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      ref={tourRefName ? (setRef(tourRefName) as any) : undefined}
      style={{
        flex: 1,
        alignItems: "center",
      }}
    >
      <View>
        <IconComponent color={color} size={24} />
        {badge ? (
          <View
            position="absolute"
            top={-5}
            right={-10}
            width={18}
            height={18}
            borderRadius={9}
            backgroundColor="$red9"
            justifyContent="center"
            alignItems="center"
            borderWidth={1}
            borderColor="white"
          >
            <Text color="white" fontSize={10} fontWeight="bold">
              {typeof badge === "number" && badge > 9 ? "9+" : badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        letterSpacing={-0.4}
        mt={4}
        color={color}
        fontSize={11}
        fontWeight="bold"
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default BottomTabItem;
