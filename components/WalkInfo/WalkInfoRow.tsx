import React from "react";
import { Button, Text, XStack } from "tamagui";

export interface Section {
  icon: React.ReactNode;
  label?: string;
  value?: string;
  fontWeight?: "normal" | "bold";
  action?: {
    icon: React.ReactNode;
    label?: string;
    onPress: () => void;
    accessibilityLabel: string;
  };
}

interface Props {
  sections: Section[];
  justifyContent?: "flex-start" | "space-between" | "flex-end" | "center";
  width?: string | number;
}

export function WalkInfoRow({
  sections,
  justifyContent = "flex-start",
  width = "100%",
}: Props) {
  return (
    <XStack justifyContent={justifyContent} width={width} alignItems="center">
      {sections.map((section, index) => (
        <XStack key={index} alignItems="center" gap="$2" flex={1}>
          {section.icon}
          <Text
            color="white"
            fontSize="$3"
            fontWeight={section.fontWeight || "bold"}
            flex={1}
          >
            {section.label}
            {section.value && section.label && ": "}
            {section.value && (
              <Text
                color="white"
                fontSize={section.fontWeight ? "$3" : "$2"}
                fontWeight={section.fontWeight ? section.fontWeight : "normal"}
              >
                {section.value}
              </Text>
            )}
          </Text>
          {section.action && (
            <Button
              size="$1"
              chromeless={!section.action.label}
              circular={!section.action.label}
              icon={section.action.icon}
              onPress={section.action.onPress}
              accessibilityLabel={section.action.accessibilityLabel}
              color="white"
              backgroundColor={section.action.label ? "$blue10" : undefined}
              paddingHorizontal={section.action.label ? "$2" : undefined}
              marginLeft="$2"
            >
              {section.action.label}
            </Button>
          )}
        </XStack>
      ))}
    </XStack>
  );
}
