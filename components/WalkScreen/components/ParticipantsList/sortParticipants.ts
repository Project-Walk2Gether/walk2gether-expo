import { ParticipantWithRoute } from "walk2gether-shared";

/**
 * Sorts participants based on the following criteria:
 * 1. Confirmed participants first
 * 2. Among confirmed participants, the walk owner first
 * 3. Then by status: "arrived" participants first
 * 4. Then "on-the-way" participants
 * 5. Finally alphabetically by display name
 */
export const sortParticipants = (
  participants: ParticipantWithRoute[],
  currentUserId?: string
): ParticipantWithRoute[] => {
  return [...participants].sort((a, b) => {
    const aIsConfirmed = !!a.acceptedAt;
    const bIsConfirmed = !!b.acceptedAt;
    const aIsOwner = a.userUid === currentUserId;
    const bIsOwner = b.userUid === currentUserId;

    // First sort by confirmation status
    if (aIsConfirmed && !bIsConfirmed) return -1;
    if (!aIsConfirmed && bIsConfirmed) return 1;

    // Among confirmed participants, owners first
    if (aIsConfirmed && bIsConfirmed) {
      if (aIsOwner && !bIsOwner) return -1;
      if (!aIsOwner && bIsOwner) return 1;
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
};
