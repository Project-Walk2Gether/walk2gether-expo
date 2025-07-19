import React, { ReactNode } from "react";
import { Card, H4, XStack, YStack } from "tamagui";

interface Props {
  title: string;
  children: ReactNode;
  testID?: string;
  headerAction?: ReactNode;
}

/**
 * A reusable card component for walk details sections
 * with optional action button in the header
 */
export default function WalkDetailsCard({ 
  title, 
  children, 
  testID,
  headerAction 
}: Props) {
  return (
    <Card 
      backgroundColor="white" 
      elevate 
      borderRadius="$4"
      testID={testID}
    >
      <Card.Header>
        <XStack justifyContent="space-between" alignItems="center" width="100%">
          <H4>{title}</H4>
          {headerAction}
        </XStack>
      </Card.Header>
      <Card.Footer padding="$3" paddingTop="$0">
        {children}
      </Card.Footer>
    </Card>
  );
}
