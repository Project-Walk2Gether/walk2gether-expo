import React from "react";
import { Text, XStack } from "tamagui";

export interface Section {
  icon: React.ReactNode;
  label: string;
  value?: string;
  fontWeight?: "normal" | "bold";
}

interface Props {
  sections: Section[];
  justifyContent?: "flex-start" | "space-between" | "flex-end" | "center";
  width?: string | number;
}

export function WalkInfoRow({ 
  sections, 
  justifyContent = "flex-start",
  width = "100%"
}: Props) {
  return (
    <XStack justifyContent={justifyContent} width={width} alignItems="center">
      {sections.map((section, index) => (
        <XStack key={index} alignItems="center" gap="$2">
          {section.icon}
          <Text 
            color="white" 
            fontSize="$3" 
            fontWeight={section.fontWeight || "bold"}
          >
            {section.label}
            {section.value && ": "}
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
        </XStack>
      ))}
    </XStack>
  );
}
