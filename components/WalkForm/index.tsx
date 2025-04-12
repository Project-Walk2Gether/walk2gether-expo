import React from "react";
import { Walk } from "walk2gether-shared";
import FriendGroupWalkForm from "./variants/FriendGroupWalkForm";
import NeighborhoodWalkForm from "./variants/NeighborhoodWalkForm";

// Basic form values interface to export for use in other components
type WalkType = Walk["type"];

interface WalkFormProps {
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
}: WalkFormProps) {
  // Determine which form to show based on walk type
  const walkType = (initialValues.type as WalkType) || "neighborhood";

  // Route to the appropriate form based on walk type
  switch (walkType) {
    case "friends":
      return (
        <FriendGroupWalkForm
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
          initialValues={initialValues}
          onSubmit={onSubmit}
          submitButtonText={submitButtonText}
          onCancel={onCancel}
          googleApiKey={googleApiKey}
        />
      );
  }
}
