import { Formik, FormikProps } from "formik";
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Button, View, YStack } from "tamagui";

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

          <View style={styles.buttonContainer}>
            <Button
              size="$4"
              onPress={() => formikProps.handleSubmit()}
              theme="blue"
              style={styles.button}
              disabled={formikProps.isSubmitting}
            >
              {formikProps.isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                submitButtonText
              )}
            </Button>
          </View>
        </YStack>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
