import React from "react";
import { NeighborhoodWalk, Walk } from "walk2gether-shared";
import FriendsWalkForm from "./variants/FriendsWalkForm";
import NeighborhoodWalkForm from "./variants/NeighborhoodWalkForm";

// Basic form values interface to export for use in other components
type WalkType = Walk["type"];

interface Props {
  initialValues: Walk;
  onSubmit: (values: Walk) => Promise<void>;
  submitButtonText: string;
  onCancel: () => void;
  googleApiKey: string;
}

export default function WalkForm({
  initialValues,
  onSubmit,
  submitButtonText,
  onCancel,
  googleApiKey,
}: Props) {
  // Determine which form to show based on walk type
  const type = (initialValues.type as WalkType) || "neighborhood";

  // Route to the appropriate form based on walk type
  switch (type) {
    case "friends":
      return (
        <FriendsWalkForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          submitButtonText={submitButtonText}
          onCancel={onCancel}
          googleApiKey={googleApiKey}
        />
      );
    case "neighborhood":
    default:
      return (
        <NeighborhoodWalkForm
          initialValues={initialValues as NeighborhoodWalk}
          onSubmit={onSubmit}
          submitButtonText={submitButtonText}
          onCancel={onCancel}
          googleApiKey={googleApiKey}
        />
      );
  }
}
