import React from "react";
import { Text, YStack } from "tamagui";
import { NeighborhoodWalk, neighborhoodWalkSchema } from "walk2gether-shared";
import DateTimeField from "../components/DateTimeField";
import DurationField from "../components/DurationField";
import FormProvider from "../components/FormProvider";
import LocationField from "../components/LocationField";

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
  googleApiKey,
}: NeighborhoodWalkFormProps) {
  return (
    <FormProvider
      initialValues={initialValues}
      validationSchema={neighborhoodWalkSchema}
      onSubmit={onSubmit}
      submitButtonText={submitButtonText}
      onCancel={onCancel}
    >
      {({ values, setFieldValue, errors, touched }) => (
        <YStack gap="$4">
          <LocationField
            value={values.location}
            onChange={(location) => setFieldValue("location", location)}
            error={errors.location?.name}
            touched={touched.location?.name}
            googleApiKey={googleApiKey}
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
          <Text>{JSON.stringify(errors)}</Text>
        </YStack>
      )}
    </FormProvider>
  );
}
