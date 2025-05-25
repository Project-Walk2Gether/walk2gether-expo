import { COLORS } from "@/styles/colors";
import { ParticipantWithRoute } from "walk2gether-shared";

// Define the walk status type based on getWalkStatus return value
type WalkStatus = "active" | "past" | "future";

interface ParticipantStatusInfo {
  text: string;
  color: string;
  icon?: string;
}

/**
 * Get participant status text and color based on their state and walk status
 */
export const getParticipantStatusInfo = (
  participant: ParticipantWithRoute,
  walkStatus: WalkStatus
): ParticipantStatusInfo => {
  // Debug logging for Michael 2089
  if (participant.displayName?.includes("2089")) {
    console.log("Michael 2089 DEBUG:", {
      displayName: participant.displayName,
      status: participant.status,
      sourceType: participant.sourceType,
      acceptedAt: participant.acceptedAt,
      cancelledAt: participant.cancelledAt,
      deniedAt: participant.deniedAt,
      walkStatus,
      participantData: participant,
    });
  }

  const isArrived = participant.status === "arrived";
  const isOnTheWay = participant.status === "on-the-way";
  const isCancelled = !!participant.cancelledAt;
  const isAccepted = !!participant.acceptedAt;
  const isInvited = participant.sourceType === "invited";
  const isNotified = isInvited && !participant.acceptedAt;

  // Determine status display text and color
  if (isCancelled) {
    return {
      text: "Cancelled",
      color: "$gray9",
    };
  } else if (isArrived) {
    return {
      text: "Arrived!",
      color: "$green9",
    };
  } else if (isOnTheWay) {
    // Show ETA if available
    if (participant.route?.duration?.text) {
      return {
        text: `ETA: ${participant.route.duration.text}`,
        color: COLORS.primary,
      };
    } else {
      return {
        text: "On the way",
        color: COLORS.primary,
      };
    }
  } else if (isNotified) {
    // Participants who have been invited but not yet accepted
    return {
      text: "Notified about walk",
      color: "$blue9",
    };
  } else if (!isAccepted) {
    // Participants who requested to join but haven't been accepted yet
    return {
      text: "Invited",
      color: "$purple9",
    };
  } else {
    // Only show these statuses for accepted participants
    if (walkStatus === "future") {
      return {
        text: "Accepted",
        color: "$gray11",
      };
    } else if (walkStatus === "active") {
      return {
        text: "Not on the way yet",
        color: "$orange9",
      };
    } else {
      // Past walk
      return {
        text: "Couldn't make it",
        color: "$gray9",
      };
    }
  }
};

/**
 * Get border color for participant card based on their status
 */
export const getParticipantBorderColor = (
  participant: ParticipantWithRoute,
  isCurrentUser: boolean
): string => {
  if (isCurrentUser) {
    return COLORS.primary;
  }

  if (participant.cancelledAt) {
    return "$gray4";
  }

  if (participant.status === "arrived") {
    return "$green7";
  }

  if (participant.status === "on-the-way") {
    return COLORS.primary;
  }

  return "$gray4";
};

/**
 * Get opacity for participant card based on their status
 */
export const getParticipantOpacity = (
  participant: ParticipantWithRoute
): number => {
  return participant.cancelledAt ? 0.5 : 1;
};
