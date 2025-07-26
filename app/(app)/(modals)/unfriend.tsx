import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { COLORS } from "@/styles/colors";
import firestore, {
  doc,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { AlertTriangle, ArrowLeft, ChevronDown, Flag } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  Label,
  Select,
  Sheet,
  Spinner,
  Text,
  XStack,
  YStack,
  Adapt,
  Checkbox,
} from "tamagui";

export default function UnfriendScreen() {
  const params = useLocalSearchParams<{
    id: string;
    friendName: string;
  }>();
  const { user } = useAuth();
  const router = useRouter();
  const { showMessage } = useFlashMessage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [unfriendReason, setUnfriendReason] = useState<string>("");
  const [reportUser, setReportUser] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const friendshipId = params.id;
  const friendName = params.friendName || "this friend";

  const handleBack = () => {
    router.back();
  };

  const handleUnfriend = async () => {
    if (!user?.uid || !friendshipId) return;

    try {
      setIsProcessing(true);

      // Create a reference to the friendship document
      const friendshipRef = doc(firestore(), `friendships/${friendshipId}`);

      // Prepare update data
      const updateData: any = {
        deletedAt: serverTimestamp(), // Set timestamp when deleting (not null)
        deletedByUid: user.uid,
      };

      // Store the unfriend reason
      updateData.unfriendReason = unfriendReason || "No reason provided";
      
      // If user chose to report, add reporting information
      if (unfriendReason === "something_wrong" && reportUser) {
        updateData.reportedAt = firestore.FieldValue.serverTimestamp();
        updateData.reportedByUid = user.uid;
        updateData.reportReason = reportReason || "No reason provided";
      }

      // Update the friendship document
      await friendshipRef.update(updateData);

      // Show success message based on whether user also reported
      if (unfriendReason === "something_wrong" && reportUser) {
        showMessage(`You've removed and reported ${friendName}`, "success");
      } else {
        showMessage(
          `You've removed ${friendName} from your friends`,
          "success"
        );
      }

      // Navigate back to the previous screen (friends list)
      router.back();
    } catch (error) {
      console.error("Error processing request:", error);
      setIsProcessing(false);
      // Could add error handling UI here
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button
              chromeless
              circular
              size="$4"
              onPress={handleBack}
              marginLeft="$1"
              icon={<ArrowLeft size="$1.5" color="#4EB1BA" />}
            />
          ),
          headerTitle: "Remove a friend",
          headerStyle: {
            backgroundColor: "white",
          },
          headerShadowVisible: true,
          presentation: "modal",
        }}
      />

      <YStack
        flex={1}
        backgroundColor="white"
        padding="$5"
        justifyContent="space-between"
      >
        <YStack gap="$4" padding="$2">
          <XStack justifyContent="center">
            <AlertTriangle size={32} color="$red9" />
          </XStack>

          <Text fontSize="$6" fontWeight="bold" textAlign="center">
            Remove {friendName}?
          </Text>

          <Text fontSize="$4" textAlign="center" color="$gray10">
            You'll be disconnected from {friendName} on Walk2Gether.
          </Text>

          <Text fontSize="$3" color="$gray9" marginTop="$2">
            You won't be able to send messages to each other anymore, and you'll
            be removed from each other's friend list.
          </Text>

          <YStack
            backgroundColor="$gray2"
            padding="$4"
            borderRadius="$4"
            marginTop="$2"
            gap="$4"
          >
            <YStack gap="$2">
              <Label htmlFor="unfriend-reason">
                <Text fontWeight="500">Why are you removing {friendName}?</Text>
              </Label>
              
              <Select
                id="unfriend-reason"
                value={unfriendReason}
                onValueChange={value => {
                  setUnfriendReason(value);
                  // Reset reporting when changing reason
                  if (value !== "something_wrong") {
                    setReportUser(false);
                    setReportReason("");
                  }
                }}
              >
                <Select.Trigger width="100%" iconAfter={ChevronDown}>
                  <Select.Value placeholder="Select a reason" />
                </Select.Trigger>
                
                <Adapt when="sm" platform="touch">
                  <Sheet modal snapPoints={[50]}>
                    <Sheet.Frame>
                      <Sheet.ScrollView>
                        <Adapt.Contents />
                      </Sheet.ScrollView>
                    </Sheet.Frame>
                    <Sheet.Overlay />
                  </Sheet>
                </Adapt>
                
                <Select.Content>
                  <Select.Group>
                    <Select.Item index={0} value="changed_mind">
                      <Select.ItemText>Changed my mind / no reason</Select.ItemText>
                    </Select.Item>
                    <Select.Item index={1} value="something_wrong">
                      <Select.ItemText>Something's wrong</Select.ItemText>
                    </Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select>
            </YStack>
            
            {unfriendReason === "something_wrong" && (
              <YStack gap="$3">
                <XStack alignItems="center" gap="$2">
                  <Checkbox
                    id="report-user"
                    size="$4"
                    checked={reportUser}
                    onCheckedChange={(checked) => {
                      setReportUser(checked as boolean);
                      // If unchecked, clear the reason
                      if (!checked) {
                        setReportReason("");
                      }
                    }}
                  >
                    <Checkbox.Indicator>
                      <Flag size={16} color="$red9" />
                    </Checkbox.Indicator>
                  </Checkbox>

                  <Label htmlFor="report-user" paddingLeft="$2">
                    <Text fontWeight="500">Report {friendName} to Walk2Gether</Text>
                  </Label>
                </XStack>

                {reportUser && (
                  <Text fontSize="$3" color="$gray9">
                    Our team will review your report. This user won't know you
                    reported them.
                  </Text>
                )}
              </YStack>
            )}
          </YStack>
        </YStack>

        <YStack gap="$4" padding="$2">
          {isProcessing ? (
            <YStack alignItems="center">
              <Spinner size="large" color={COLORS.primary} />
              <Text marginTop="$4" color="$gray9">
                Processing...
              </Text>
            </YStack>
          ) : (
            <>
              <Button
                backgroundColor="$red9"
                color="white"
                size="$5"
                onPress={handleUnfriend}
                pressStyle={{ backgroundColor: "$red10" }}
              >
                Remove {unfriendReason === "something_wrong" && reportUser ? "and Report" : ""}
              </Button>

              <Button variant="outlined" size="$5" onPress={handleBack}>
                Cancel
              </Button>
            </>
          )}
        </YStack>
      </YStack>
    </>
  );
}
