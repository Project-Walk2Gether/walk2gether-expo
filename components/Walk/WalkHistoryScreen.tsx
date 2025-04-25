import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Stack } from "expo-router";
import { Card, ScrollView, Text, View, XStack, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";

interface Props {
  walk: Walk;
}

// Given a walk that the user has been on, show the partners they were matched with
export default function WalkHistoryScreen({ walk }: Props) {
  // const allPartnerUids = allWalkPartnerUids(walk);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "This walk has finished",
          headerShadowVisible: false,
          headerBackVisible: true,
          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        flex={1}
        backgroundColor={COLORS.background}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >
        <Card
          backgroundColor={COLORS.card}
          borderRadius={12}
          padding={20}
          marginBottom={20}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.1}
          shadowRadius={2}
          elevation={2}
        >
          <Text
            fontSize={22}
            fontWeight="bold"
            marginBottom={8}
          >
            {walk.organizerName}
          </Text>
          
          <Text
            fontSize={16}
            marginBottom={12}
          >
            {format(walk.date.toDate(), "EEEE, MMMM d, yyyy")} at{" "}
            {format(walk.date.toDate(), "h:mm a")}
          </Text>

          {walk.location && (
            <Text
              fontSize={16}
              color={COLORS.textSecondary}
              marginBottom={8}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color={COLORS.textSecondary}
              />{" "}
              {walk.location.name}
            </Text>
          )}

          <Text
            fontSize={16}
            color={COLORS.textSecondary}
            marginBottom={8}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={COLORS.textSecondary}
            />{" "}
            {walk.durationMinutes} minutes
          </Text>

          {/* Rotation information would go here if available */}
        </Card>
      </ScrollView>
    </>
  );
}

const COLORS = {
  primary: "#4285F4",
  background: "#f8f8f8",
  card: "#ffffff",
  text: "#333333",
  textSecondary: "#666666",
  border: "#e0e0e0",
};
