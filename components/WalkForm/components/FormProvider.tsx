import { Formik, FormikProps } from "formik";
import React from "react";
import { XStack, YStack } from "tamagui";
import { ActionButton } from "@/components/ActionButton";

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
  onCancel,
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
            <ActionButton
              onPress={() => formikProps.handleSubmit()}
              label={submitButtonText}
              loading={formikProps.isSubmitting}
              disabled={formikProps.isSubmitting}
            />
          </XStack>
        </YStack>
      )}
    </Formik>
  );
}
