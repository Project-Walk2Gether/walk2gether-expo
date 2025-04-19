import React from "react";
import { StyleSheet } from "react-native";
import { YStack } from "tamagui";
import { FriendsWalk, friendsWalkSchema } from "walk2gether-shared";
import DateTimeField from "../components/DateTimeField";
import DurationField from "../components/DurationField";
import FormProvider from "../components/FormProvider";
import LocationField from "../components/LocationField";

interface Props {
  initialValues: Partial<FriendsWalk>;
  onSubmit: (values: FriendsWalk) => Promise<void>;
  submitButtonText: string;
  onCancel: () => void;
  googleApiKey: string;
}

export default function FriendsWalkForm({
  initialValues,
  onSubmit,
  submitButtonText,
  onCancel,
  googleApiKey,
}: Props) {
  return (
    <FormProvider
      initialValues={initialValues}
      validationSchema={friendsWalkSchema}
      onSubmit={onSubmit}
      submitButtonText={submitButtonText}
      onCancel={onCancel}
    >
      {({ values, setFieldValue, errors, touched }) => (
        <YStack gap="$4">
          <DateTimeField
            value={values.date}
            onChange={(date) => setFieldValue("date", date)}
            error={errors.date}
            touched={touched.date}
          />
          <LocationField
            value={values.location}
            onChange={(location) => setFieldValue("location", location)}
            error={errors.location?.name}
            touched={touched.location?.name}
            googleApiKey={googleApiKey}
          />

          <DurationField
            value={values.durationMinutes}
            onChange={(minutes) => setFieldValue("durationMinutes", minutes)}
            error={errors.durationMinutes}
            touched={touched.durationMinutes}
          />

          {/* Friend group specific fields can be added here */}
        </YStack>
      )}
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
