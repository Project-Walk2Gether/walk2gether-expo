import { Formik } from "formik";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { Button, Input, Text, YStack } from "tamagui";
import * as yup from "yup";

const verificationSchema = yup.object().shape({
  verificationCode: yup.string().required("Verification code is required"),
});
export type VerificationSchema = yup.InferType<typeof verificationSchema>;

interface Props {
  goBack: () => void;
  handleSubmit: (values: VerificationSchema) => Promise<any>;
}

export default function VerificationCodeForm({ handleSubmit }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <Formik
      initialValues={{
        verificationCode: "",
      }}
      validationSchema={verificationSchema}
      onSubmit={handleSubmit}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        values,
        errors,
        touched,
        isValid,
      }) => (
        <>
          <YStack width="100%" marginBottom="$3">
            <Input
              placeholder="Enter verification code"
              value={values.verificationCode}
              onChangeText={handleChange("verificationCode")}
              onBlur={handleBlur("verificationCode")}
              keyboardType="number-pad"
              placeholderTextColor="#999"
              autoFocus
              height={50}
              borderWidth={1}
              borderColor={
                touched.verificationCode && errors.verificationCode
                  ? "$red10"
                  : "#ddd"
              }
              borderRadius="$3"
              paddingHorizontal="$4"
              fontSize="$4"
              backgroundColor="#f9f9f9"
            />
            {touched.verificationCode && errors.verificationCode && (
              <Text color="$red10" fontSize="$2" marginTop="$1">
                {errors.verificationCode}
              </Text>
            )}
          </YStack>

          <Button
            backgroundColor="#4EB1BA"
            width="100%"
            height={55}
            borderRadius={10}
            justifyContent="center"
            alignItems="center"
            marginTop={10}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.22}
            shadowRadius={2.22}
            elevation={3}
            opacity={!isValid || loading ? 0.5 : 1}
            onPress={() => handleSubmit()}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text color="white" fontSize="$5" fontWeight="bold">
                Let's go!
              </Text>
            )}
          </Button>
        </>
      )}
    </Formik>
  );
}
