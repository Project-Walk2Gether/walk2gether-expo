import React from "react";
import { YStack } from "tamagui";
import { FormikErrors, FormikTouched } from "formik";
import { Walk, NeighborhoodWalk, FriendsWalk, friendsWalkSchema, neighborhoodWalkSchema } from "walk2gether-shared";
import { WithId } from "walk2gether-shared/lib/utils/persisted";

// Form components
import FormProvider from "./components/FormProvider";
import DateTimeField from "./components/DateTimeField";
import DurationField from "./components/DurationField";
import LocationAutocomplete from "../LocationAutocomplete";

// Basic form values interface to export for use in other components
type WalkType = "friends" | "neighborhood" | "meetup";

interface Props {
  initialValues: WithId<Walk>;
  onSubmit: (values: WithId<Walk>) => Promise<void>;
  submitButtonText: string;
  onCancel: () => void;
  googleApiKey: string;
}

// Type guard to check if a walk is a FriendsWalk
function isFriendsWalk(walk: WithId<Walk>): walk is WithId<FriendsWalk> {
  return walk.type === "friends";
}

// Type guard to check if a walk is a NeighborhoodWalk
function isNeighborhoodWalk(walk: WithId<Walk>): walk is WithId<NeighborhoodWalk> {
  return walk.type === "neighborhood";
}

export default function WalkForm({
  initialValues,
  onSubmit,
  submitButtonText,
  onCancel,
  googleApiKey,
}: Props) {
  // Determine which form to show based on walk type
  const type = initialValues.type as WalkType || "neighborhood";
  
  // Get the appropriate validation schema based on walk type
  const validationSchema = type === "friends" ? friendsWalkSchema : neighborhoodWalkSchema;
  
  // Since we're only editing existing walks, we don't need to augment initialValues
  
  return (
    <FormProvider
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      submitButtonText={submitButtonText}
      onCancel={onCancel}
    >
      {({ values, setFieldValue, errors, touched }) => (
        <YStack gap="$4">
          {/* Date field - common to both walk types */}
          <DateTimeField
            value={values.date}
            onChange={(date) => setFieldValue("date", date)}
            error={errors.date as string | undefined}
            touched={!!touched.date}
          />
          
          {/* Location field - common implementation with startLocation */}
          <LocationAutocomplete
            value={values.startLocation}
            setFieldValue={setFieldValue}
            touched={touched}
            errors={errors}
            placeholder="Enter a location for your walk"
          />
          
          {/* Duration field - common to both walk types */}
          <DurationField
            value={values.durationMinutes}
            onChange={(minutes) => setFieldValue("durationMinutes", minutes)}
            error={errors.durationMinutes as string | undefined}
            touched={!!touched.durationMinutes}
          />
        </YStack>
      )}
    </FormProvider>
  );
}
