import { COLORS } from "@/styles/colors";
import { 
  getParticipantStatusInfo, 
  getParticipantBorderColor, 
  getParticipantOpacity 
} from "@/utils/participantStatus";
import { formatNamesInSentenceCase } from "@/utils/participantFilters";
import { getWalkStatus } from "@/utils/walkUtils";
import {
  AlertCircle,
  Car,
  CheckCircle2,
  Footprints,
} from "@tamagui/lucide-icons";
import React from "react";
import { FlatList } from "react-native";
import { Avatar, Text, XStack, YStack } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";

interface Props {
  status: ReturnType<typeof getWalkStatus>;
  participants: ParticipantWithRoute[];
  currentUserId?: string;
  isOwner: boolean;
  onParticipantPress?: (participant: ParticipantWithRoute) => void;
}

export default function ParticipantsList({
  status,
  participants,
  currentUserId,
  isOwner,
  onParticipantPress,
}: Props) {
  // For ALL users (even owners), we don't directly show invited participants
  // They'll be shown as a special message item
  const confirmedParticipants = participants.filter(p => 
    // Include accepted participants or those who are on the way/arrived
    !!p.acceptedAt || p.status === "on-the-way" || p.status === "arrived"
  );
  
  // Get invited participants (those who haven't accepted/rejected/cancelled yet)
  const invitedParticipants = isOwner 
    ? participants.filter(p => 
        !p.acceptedAt && 
        !p.rejectedAt && 
        !p.cancelledAt && 
        p.sourceType === "invited")
    : [];

  // Sort participants based on requirements
  const sortedParticipants = [...confirmedParticipants].sort((a, b) => {
    const aIsConfirmed = !!a.acceptedAt;
    const bIsConfirmed = !!b.acceptedAt;
    const aIsOwner = a.userUid === currentUserId;
    const bIsOwner = b.userUid === currentUserId;

    // First sort by confirmation status
    if (aIsConfirmed && !bIsConfirmed) return -1;
    if (!aIsConfirmed && bIsConfirmed) return 1;

    // Among confirmed participants, owners last
    if (aIsConfirmed && bIsConfirmed) {
      if (aIsOwner && !bIsOwner) return 1;
      if (!aIsOwner && bIsOwner) return -1;
    }

    // Then by status: arrived first
    if (a.status === "arrived" && b.status !== "arrived") return -1;
    if (b.status === "arrived" && a.status !== "arrived") return 1;

    // Then on-the-way
    if (a.status === "on-the-way" && b.status === "pending") return -1;
    if (b.status === "on-the-way" && a.status === "pending") return 1;

    // Alphabetically by name
    return a.displayName.localeCompare(b.displayName);
  });

  const renderItem = ({ item }: { item: ParticipantWithRoute }) => {
    const isCurrentUser = item.id === currentUserId;
    
    // Get participant status information from the utility function
    const statusInfo = getParticipantStatusInfo(item, status);
    const statusText = statusInfo.text;
    const statusColor = statusInfo.color;

    // Only allow pressing participants that are not the current user
    const handlePress = () => {
      if (!isCurrentUser && onParticipantPress) {
        onParticipantPress(item);
      }
    };

    return (
      <XStack
        onPress={isCurrentUser ? undefined : handlePress}
        padding="$2"
        margin="$1"
        gap="$2"
        alignItems="center"
        pressStyle={{ scale: 0.98 }}
        animation="quick"
        borderRadius="$4"
        backgroundColor="$gray1"
        borderWidth={1}
        borderColor={getParticipantBorderColor(item, isCurrentUser)}
        opacity={getParticipantOpacity(item)}
      >
        {/* Row 1: Avatar and name */}
        <Avatar circular size="$3">
          {item.photoURL ? (
            <Avatar.Image src={item.photoURL} />
          ) : (
            <Avatar.Fallback
              justifyContent="center"
              alignItems="center"
              backgroundColor={COLORS.primary}
            >
              <Text color="white" fontSize="$2">
                {item.displayName?.charAt(0).toUpperCase()}
              </Text>
            </Avatar.Fallback>
          )}
        </Avatar>
        <YStack gap="$1">
          <XStack alignItems="center" gap="$1">
            {/* Mode/status icon */}
            {item.cancelledAt ? (
              <AlertCircle size={14} color="$gray9" />
            ) : item.status === "arrived" ? (
              <CheckCircle2 size={14} color="$green9" />
            ) : item.status === "on-the-way" ? (
              item.navigationMethod === "driving" ? (
                <Car size={14} color={COLORS.primary} />
              ) : (
                <Footprints size={14} color={COLORS.primary} />
              )
            ) : (
              <AlertCircle size={14} color="$orange9" />
            )}
            <Text
              fontSize="$2"
              fontWeight="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
              flexShrink={1}
            >
              {isCurrentUser ? "You" : item.displayName}
            </Text>
          </XStack>
          {/* Row 2: Combined mode icon and status with ETA */}
          <XStack alignItems="center" gap="$1">
            {/* Status text with ETA */}
            <Text
              fontSize="$1"
              color={statusColor}
              fontWeight="bold"
              flexShrink={1}
              numberOfLines={1}
            >
              {statusText}
            </Text>
          </XStack>

          {/* Introduction text if available */}
          {item.introduction && (
            <Text
              fontSize="$1"
              color="$gray10"
              fontStyle="italic"
              mt="$1"
              maxWidth="100%"
              flexShrink={1}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              "{item.introduction}"
            </Text>
          )}
        </YStack>
      </XStack>
    );
  };

  // Define a type that extends ParticipantWithRoute to include our flag
  type ExtendedParticipant = ParticipantWithRoute & { isInvitedParticipant?: boolean };
  
  // Create a combined data array that includes regular participants and invited participants
  const dataArray: ExtendedParticipant[] = [...sortedParticipants];
  
  // Add invited participants as individual items if the user is the owner
  if (isOwner && invitedParticipants.length > 0) {
    // Add each invited participant to the data array
    invitedParticipants.forEach(participant => {
      dataArray.push({
        ...participant,
        isInvitedParticipant: true // Flag to identify this as an invited participant
      } as ExtendedParticipant);
    });
  }
  
  // Modified renderItem to handle both regular and invited participants
  const renderListItem = ({ item }: { item: ParticipantWithRoute & { isInvitedParticipant?: boolean } }) => {
    // Check if this is an invited participant
    if (item.isInvitedParticipant) {
      const isCurrentUser = item.id === currentUserId;
      
      return (
        <XStack
          padding="$2"
          margin="$1"
          gap="$2"
          alignItems="center"
          pressStyle={{ scale: 0.98 }}
          animation="quick"
          borderRadius="$4"
          backgroundColor="$gray1"
          borderWidth={1}
          borderColor="$blue7"
          opacity={1}
        >
          {/* Same avatar and name layout as regular participants */}
          <Avatar circular size="$3">
            {item.photoURL ? (
              <Avatar.Image src={item.photoURL} />
            ) : (
              <Avatar.Fallback
                justifyContent="center"
                alignItems="center"
                backgroundColor={COLORS.primary}
              >
                <Text color="white" fontSize="$2">
                  {item.displayName?.charAt(0).toUpperCase()}
                </Text>
              </Avatar.Fallback>
            )}
          </Avatar>
          <YStack gap="$1">
            {/* Top row: Name */}
            <XStack alignItems="center" gap="$1">
              <Text
                fontSize="$2"
                fontWeight="bold"
                numberOfLines={1}
                ellipsizeMode="tail"
                flexShrink={1}
              >
                {isCurrentUser ? "You" : item.displayName}
              </Text>
            </XStack>
            
            {/* Bottom row: Status text */}
            <Text
              fontSize="$1"
              color="$blue9"
              fontWeight="bold"
              flexShrink={1}
              numberOfLines={1}
            >
              Waiting for response
            </Text>
          </YStack>
        </XStack>
      );
    }
    
    // Otherwise, render a regular participant item
    return renderItem({ item });
  };
  
  return (
    <FlatList
      data={dataArray}
      renderItem={({ item }) => renderListItem({ item })} 
      keyExtractor={(item) => item.id || `participant-${item.userUid}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12 }}
    />
  );
}
