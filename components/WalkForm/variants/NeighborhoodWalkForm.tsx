import DateTimeField from "@/components/WalkForm/components/DateTimeField";
import DurationField from "@/components/WalkForm/components/DurationField";
import FormProvider from "@/components/WalkForm/components/FormProvider";
import React from "react";
import { YStack } from "tamagui";
import { NeighborhoodWalk, neighborhoodWalkSchema } from "walk2gether-shared";
import LocationAutocomplete from "../../LocationAutocomplete";

interface NeighborhoodWalkFormProps {
  initialValues: Partial<NeighborhoodWalk>;
  onSubmit: (values: NeighborhoodWalk) => Promise<void>;
  submitButtonText: string;
  onCancel: () => void;
  googleApiKey: string;
}

export default function NeighborhoodWalkForm({
  initialValues,
  onSubmit,
  submitButtonText,
  onCancel,
}: NeighborhoodWalkFormProps) {
  const [showLocationResults, setShowLocationResults] = React.useState(false);
  return (
    <FormProvider
      initialValues={initialValues}
      validationSchema={neighborhoodWalkSchema}
      onSubmit={onSubmit}
      submitButtonText={submitButtonText}
      onCancel={onCancel}
    >
      {({ values, setFieldValue, errors, touched }) => {
        return (
          <YStack gap="$4">
            <LocationAutocomplete
              value={values.location}
              setFieldValue={setFieldValue}
              showLocationResults={showLocationResults}
              setShowLocationResults={setShowLocationResults}
              touched={touched}
              errors={errors}
              styles={{}}
              placeholder="Enter a location for your walk"
            />
            <DateTimeField
              value={values.date}
              onChange={(date) => setFieldValue("date", date)}
              error={errors.date}
              touched={touched.date}
            />
            <DurationField
              value={values.durationMinutes}
              onChange={(minutes) => setFieldValue("durationMinutes", minutes)}
              error={errors.durationMinutes}
              touched={touched.durationMinutes}
            />
          </YStack>
        );
      }}
    </FormProvider>
  );
}
