import { Formik, FormikProps } from "formik";
import React from "react";
import { ActivityIndicator } from "react-native";
import { Button, XStack, YStack } from "tamagui";

interface FormProviderProps<T> {
  initialValues: T;
  validationSchema: any;
  onSubmit: (values: T) => Promise<void>;
  submitButtonText: string;
  onCancel: () => void;
  children: (formikProps: FormikProps<T>) => React.ReactNode;
}

export default function FormProvider<T>({
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

          <XStack flexDirection="row" justifyContent="space-between" marginTop="$4">
            <Button
              size="$4"
              onPress={() => formikProps.handleSubmit()}
              theme="blue"
              flex={1}
              marginHorizontal="$1"
              disabled={formikProps.isSubmitting}
            >
              {formikProps.isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                submitButtonText
              )}
            </Button>
          </XStack>
        </YStack>
      )}
    </Formik>
  );
}
