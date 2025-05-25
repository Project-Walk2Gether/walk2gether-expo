import { FormikErrors, FormikTouched } from "formik";
import React from "react";
import { YStack } from "tamagui";
import { Walk, walkSchema } from "walk2gether-shared";
import { WithId } from "walk2gether-shared/lib/utils/persisted";

// Form components
import { FormControl } from "../FormControl";
import LocationAutocomplete from "../LocationAutocomplete";
import DateTimeField from "./components/DateTimeField";
import DurationField from "./components/DurationField";
import FormProvider from "./components/FormProvider";
import LocationNotesField from "./components/LocationNotesField";

// Basic form values interface to export for use in other components
type WalkType = "friends" | "neighborhood" | "meetup";

interface Props {
  initialValues: WithId<Walk>;
  onSubmit: (values: WithId<Walk>) => Promise<void>;
  submitButtonText: string;
  onCancel: () => void;
  googleApiKey: string;
}

export default function WalkForm({
  initialValues,
  onSubmit,
  submitButtonText,
  onCancel,
}: Props) {
  return (
    <FormProvider
      initialValues={initialValues}
      validationSchema={walkSchema}
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
          <FormControl label="Location">
            <LocationAutocomplete
              value={values.startLocation}
              setFieldValue={(field, value) => {
                // LocationAutocomplete sets 'location', but we need 'startLocation'
                if (field === "location") {
                  setFieldValue("startLocation", {
                    ...value,
                    // Preserve existing notes if any
                    notes: values.startLocation?.notes || "",
                  });
                } else {
                  setFieldValue(field, value);
                }
              }}
              touched={{
                location: touched.startLocation,
              }}
              errors={{
                location: errors.startLocation,
              }}
              placeholder="Enter a location for your walk"
            />
          </FormControl>

          {/* Location notes field - only show if a location is selected */}
          {values.startLocation && (
            <LocationNotesField
              value={values.startLocation?.notes || ""}
              onChange={(notes) => {
                setFieldValue("startLocation", {
                  ...values.startLocation,
                  notes,
                });
              }}
              error={
                (errors.startLocation as FormikErrors<any>)?.notes as
                  | string
                  | undefined
              }
              touched={!!(touched.startLocation as FormikTouched<any>)?.notes}
            />
          )}

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
