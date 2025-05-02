import { Pencil } from "@tamagui/lucide-icons";
import { Formik } from "formik";
import { useState } from "react";
import { Button, Input, Text, XStack, YStack } from "tamagui";
import * as yup from "yup";
import { ActionButton } from "../../ActionButton";

const verificationSchema = yup.object().shape({
  verificationCode: yup.string().required("Verification code is required"),
});
export type VerificationSchema = yup.InferType<typeof verificationSchema>;

interface Props {
  goBack: () => void;
  handleSubmit: (values: VerificationSchema) => Promise<any>;
  phoneNumber: string;
}

export default function VerificationCodeForm({
  goBack,
  handleSubmit,
  phoneNumber,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (values: VerificationSchema) => {
    try {
      setLoading(true);
      await handleSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        verificationCode: "",
      }}
      validationSchema={verificationSchema}
      onSubmit={handleFormSubmit}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        isValid,
      }) => (
        <>
          <YStack width="100%" marginBottom="$2">
            <XStack ai="center" jc="space-between">
              <Text color="$gray10" fontSize="$3" textAlign="center">
                Sent to {phoneNumber}
              </Text>
              <Button
                backgroundColor="transparent"
                width="auto"
                height={40}
                marginBottom="$1"
                justifyContent="center"
                alignItems="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={goBack}
                icon={<Pencil />}
              >
                Change
              </Button>
            </XStack>
          </YStack>
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

          <ActionButton
            onPress={handleSubmit}
            disabled={!isValid || loading}
            loading={loading}
            label="Let's go!"
          ></ActionButton>
        </>
      )}
    </Formik>
  );
}
