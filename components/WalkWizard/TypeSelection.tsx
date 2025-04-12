import React from "react";
import { StyleSheet } from "react-native";
import { YStack } from "tamagui";
import WalkTypeCard from "../../components/WalkTypeCard";
import { useWalkForm } from "../../context/WalkFormContext";
import { BrandGradient } from "../UI";

interface TypeSelectionProps {
  onContinue: () => void;
}

export const TypeSelection: React.FC<TypeSelectionProps> = ({ onContinue }) => {
  const { formData, updateFormData } = useWalkForm();

  const setSelectedWalkType = (
    type: "friends" | "meetup" | "neighborhood" | null
  ) => {
    updateFormData({
      walkType: type,
      isNeighborhoodWalk: type === "neighborhood",
    });

    // Automatically proceed when a type is selected
    if (type) {
      onContinue();
    }
  };

  return (
    <BrandGradient style={styles.container}>
      <YStack gap="$4" paddingHorizontal="$4" paddingVertical="$4">
        <YStack gap="$4">
          <WalkTypeCard
            type="friends"
            title="Friend Walk"
            icon="people-outline"
            color="#5A67F2"
            backgroundColor="#E7E9FE"
            description="Schedule a walk with a friend"
            selected={formData.walkType === "friends"}
            onSelect={setSelectedWalkType}
          />
          {/*
          <WalkTypeCard
            type="meetup"
            title="Friend Group"
            icon="people"
            color="#FF6A55"
            backgroundColor="#FFE9E5"
            description="Walk with a group of friends"
            selected={formData.walkType === "meetup"}
            onSelect={setSelectedWalkType}
          /> */}

          <WalkTypeCard
            type="neighborhood"
            title="Neighborhood Walk"
            icon="home-outline"
            color="#47C97E"
            backgroundColor="#E4F6ED"
            description="Walk right now, and see if your neighbors can join"
            selected={formData.walkType === "neighborhood"}
            onSelect={setSelectedWalkType}
          />
        </YStack>

        {/* Continue button removed - selection automatically proceeds */}
      </YStack>
    </BrandGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TypeSelection;
