import React from "react";
import { YStack } from "tamagui";
import { Timestamp } from "@react-native-firebase/firestore";
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
      initialValues={{
        ...initialValues,
        // Ensure required fields are present and have the right type
        date: initialValues.date || Timestamp.now(),
        location: initialValues.location || { 
          name: "", 
          latitude: 0, 
          longitude: 0, 
          description: "",
        },
        durationMinutes: initialValues.durationMinutes || 60
      } as FriendsWalk}
      validationSchema={friendsWalkSchema}
      onSubmit={onSubmit}
      submitButtonText={submitButtonText}
      onCancel={onCancel}
    >
      {({ values, setFieldValue, errors, touched }) => (
        // Using non-null assertion for form values that are required but might be initially undefined
        <YStack gap="$4">
          <DateTimeField
            value={values.date}
            onChange={(date) => setFieldValue("date", date)}
            error={errors.date as string | undefined}
            touched={!!touched.date}
          />
          <LocationField
            value={values.location}
            onChange={(location) => setFieldValue("location", location)}
            error={errors.location?.name as string | undefined}
            touched={!!touched.location?.name}
            googleApiKey={googleApiKey}
          />

          <DurationField
            value={values.durationMinutes || 60}
            onChange={(minutes) => setFieldValue("durationMinutes", minutes)}
            error={errors.durationMinutes as string | undefined}
            touched={!!touched.durationMinutes}
          />

          {/* Friend group specific fields can be added here */}
        </YStack>
      )}
    </FormProvider>
  );
}
