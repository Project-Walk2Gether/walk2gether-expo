import { ActionButton } from "@/components/ActionButton";
import { FormControl } from "@/components/FormControl";
import { FormInput } from "@/components/FormInput";
import { COLORS } from "@/styles/colors";
import { Pencil } from "@tamagui/lucide-icons";
import { Formik } from "formik";
import { useState } from "react";
import { Text, YStack } from "tamagui";
import * as yup from "yup";

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
          <FormControl
            label={`Sent to ${phoneNumber}`}
            error={errors.verificationCode}
            touched={touched.verificationCode}
            action={
              <Text
                color={COLORS.primary}
                fontSize="$3"
                fontWeight="500"
                onPress={goBack}
                pressStyle={{ opacity: 0.7 }}
              >
                Change
              </Text>
            }
          >
            <FormInput
              placeholder="Enter verification code"
              value={values.verificationCode}
              onChangeText={handleChange("verificationCode")}
              onBlur={handleBlur("verificationCode")}
              keyboardType="number-pad"
              placeholderTextColor="#999"
              autoFocus
              height={50}
              fontSize="$4"
              error={errors.verificationCode}
              touched={touched.verificationCode}
            />
          </FormControl>

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
