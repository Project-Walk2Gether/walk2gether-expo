import PrimaryButton from "@/components/PrimaryButton";
import { Formik, FormikProps } from "formik";
import React from "react";
import { XStack, YStack } from "tamagui";

interface FormProviderProps<T extends object> {
  initialValues: T;
  validationSchema: any;
  onSubmit: (values: T) => Promise<void>;
  submitButtonText: string;
  onCancel: () => void;
  children: (formikProps: FormikProps<T>) => React.ReactNode;
}

export default function FormProvider<T extends object>({
  initialValues,
  validationSchema,
  onSubmit,
  submitButtonText,
  children,
}: FormProviderProps<T>) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <YStack gap="$4">
          {children(formikProps)}

          <XStack
            flexDirection="row"
            justifyContent="space-between"
            marginTop="$4"
            width="100%"
          >
            <PrimaryButton
              onPress={() => formikProps.handleSubmit()}
              disabled={formikProps.isSubmitting}
              width="100%"
            >
              {formikProps.isSubmitting ? "Saving..." : submitButtonText}
            </PrimaryButton>
          </XStack>
        </YStack>
      )}
    </Formik>
  );
}
