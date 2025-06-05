import React from "react";
import { Text, XStack, YStack } from "tamagui";
import { Participant, Walk, WithId } from "walk2gether-shared";
import { Avatar } from "tamagui";
import { COLORS } from "@/styles/colors";
import { Check, Clock, X } from "@tamagui/lucide-icons";
import { format, formatDistance } from "date-fns";

interface Props {
  walk: WithId<Walk>;
  currentUserUid?: string;
  acceptedParticipants: WithId<Participant>[];
  requestedParticipants: WithId<Participant>[];
  invitedParticipants: WithId<Participant>[];
  notifiedParticipants: WithId<Participant>[];
  deniedParticipants: WithId<Participant>[];
  cancelledParticipants: WithId<Participant>[];
}

/**
 * Participants section shown to the walk owner for friend walks
 * Shows detailed information about each participant individually
 */
export const OwnerFriendWalkParticipantsSection: React.FC<Props> = ({
  walk,
  currentUserUid,
  acceptedParticipants,
  requestedParticipants,
  invitedParticipants,
  notifiedParticipants,
  deniedParticipants,
  cancelledParticipants,
}) => {
  // Combine all participants except the current user
  const allParticipants = [
    ...acceptedParticipants,
    ...invitedParticipants,
    ...requestedParticipants,
    ...notifiedParticipants,
    ...deniedParticipants, 
    ...cancelledParticipants,
  ].filter((p) => p.userUid !== currentUserUid);

  // If no participants other than the owner, display a message
  if (allParticipants.length === 0) {
    return (
      <XStack alignItems="center" mt="$2">
        <Text fontSize={14} color="#222">
          Just you so far
        </Text>
      </XStack>
    );
  }

  // Helper function to convert any timestamp-like object to Date
  const timestampToDate = (timestamp: any): Date | undefined => {
    if (!timestamp) return undefined;
    
    // Check if timestamp has toDate method (Firebase Timestamp)
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // If it's a number (seconds or milliseconds)
    if (typeof timestamp === 'number') {
      // If it's in seconds (Firebase timestamp), convert to milliseconds
      if (timestamp < 10000000000) {
        return new Date(timestamp * 1000);
      }
      // Already in milliseconds
      return new Date(timestamp);
    }
    
    // If it has seconds and nanoseconds fields (Firestore Timestamp)
    if (timestamp && typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000);
    }
    
    // Try to create a date directly
    try {
      return new Date(timestamp);
    } catch (e) {
      console.warn('Unable to convert timestamp to date:', timestamp);
      return undefined;
    }
  };
  
  const getParticipantStatusInfo = (participant: WithId<Participant>) => {
    try {
      // Accepted participant
      if (participant.acceptedAt) {
        const date = timestampToDate(participant.acceptedAt);
        return {
          icon: <Check size={16} color="green" />,
          statusText: "Accepted",
          date: date ? format(date, "M/d/yy") : "",
        };
      }
      
      // Denied participant (previously named declined)
      if (participant.deniedAt) {
        const date = timestampToDate(participant.deniedAt);
        return {
          icon: <X size={16} color="$red10" />,
          statusText: "Declined",
          date: date ? format(date, "M/d/yy") : "",
        };
      }

      // Cancelled participant
      if (participant.cancelledAt) {
        const date = timestampToDate(participant.cancelledAt);
        return {
          icon: <X size={16} color="$red10" />,
          statusText: "Cancelled",
          date: date ? format(date, "M/d/yy") : "",
        };
      }
      
      // Check for various date fields that might indicate invitation time
      const invitationDate = timestampToDate(participant.createdAt);
      if (invitationDate) {
        // Calculate difference in milliseconds
        const diffMs = new Date().getTime() - invitationDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // If less than 1 hour, don't show the time
        if (diffHours < 1) {
          return {
            icon: <Clock size={16} color="#666" />,
            statusText: "Waiting response",
            date: "", // No time shown if less than 1 hour
          };
        }
        
        return {
          icon: <Clock size={16} color="#666" />,
          statusText: "Waiting response",
          date: `(${formatDistance(invitationDate, new Date(), { addSuffix: false })})`,
        };
      }
    } catch (error) {
      console.warn('Error processing participant status:', error);
    }

    // Default case (should rarely happen)
    return {
      icon: <Clock size={16} color="#666" />,
      statusText: "Status unknown",
      date: "",
    };
  };

  return (
    <YStack mt="$2" gap="$2">
      {allParticipants.map((participant) => {
        const { icon, statusText, date } = getParticipantStatusInfo(participant);
        
        return (
          <XStack key={participant.id} alignItems="center" gap={6} width="100%" px="$1" py="$0.5">
            {/* Avatar */}
            <Avatar size={32} circular>
              <Avatar.Image src={participant.photoURL || undefined} />
              <Avatar.Fallback
                justifyContent="center"
                alignItems="center"
                backgroundColor={COLORS.primary}
              >
                <Text color="white">
                  {(participant.displayName || "A").charAt(0).toUpperCase()}
                </Text>
              </Avatar.Fallback>
            </Avatar>
            
            {/* Name - with ellipsis if too long */}
            <Text fontSize={14} color="#222" flex={1} numberOfLines={1} ellipsizeMode="tail">
              {participant.displayName || "Unknown"}
            </Text>
            
            {/* Status with icon - compact and no wrapping */}
            <XStack alignItems="center" gap={2} flexShrink={0}>
              {icon}
              <Text fontSize={12} color="#666" numberOfLines={1}>
                {statusText} {date && date}
              </Text>
            </XStack>
          </XStack>
        );
      })}
    </YStack>
  );
};
