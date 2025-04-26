import { Formik } from "formik";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { Button, Text, View } from "tamagui";
import { ActionButton } from "../../ActionButton";
import * as yup from "yup";
import { useAuth } from "../../../context/AuthContext";

const signInSchema = yup.object().shape({
  phoneNumber: yup.string().required("Phone number is required"),
  formattedPhoneNumber: yup
    .string()
    .required("Formatted phone number is required"),
});
type SignInSchema = yup.InferType<typeof signInSchema>;

interface Props {
  onPhoneVerified: (verificationId: string, phoneNumber: string) => void;
}

export default function PhoneForm({ onPhoneVerified }: Props) {
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef<PhoneInput>(null);

  const { sendPhoneVerificationCode } = useAuth();

  const onSubmit = useCallback(
    async (values: SignInSchema) => {
      try {
        setLoading(true);
        const id = await sendPhoneVerificationCode(values.formattedPhoneNumber);
        onPhoneVerified(id, values.formattedPhoneNumber);
      } catch (error) {
        Alert.alert("Error", "Failed to send verification code");
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [sendPhoneVerificationCode]
  );

  return (
    <Formik
      initialValues={{
        phoneNumber: "",
        formattedPhoneNumber: "",
      }}
      validationSchema={signInSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleSubmit, values, errors, touched, isValid }) => (
        <>
          <View width="100%">
            <PhoneInput
              ref={phoneInputRef}
              defaultValue={values.phoneNumber}
              defaultCode="US"
              layout="first"
              onChangeText={handleChange("phoneNumber")}
              onChangeFormattedText={handleChange("formattedPhoneNumber")}
              containerStyle={{
                width: "100%",
              }}
              textContainerStyle={{
                paddingHorizontal: 0,
                borderRadius: 10,
                paddingVertical: 8,
                backgroundColor: "transparent",
                flex: 1,
              }}
              textInputStyle={{
                height: 50,
                marginLeft: 10,
                // borderWidth: 1,
                // borderColor: "#ddd",
                borderBottomColor: "#ddd",
                borderBottomWidth: 1,
                // borderRadius: 10,
                paddingHorizontal: 15,
                fontSize: 16,
                backgroundColor: "#f9f9f9",
              }}
              codeTextStyle={{
                color: "#000",
              }}
            />
            {touched.phoneNumber && errors.phoneNumber && (
              <Text color="red" fontSize={12} marginTop={2}>
                {errors.phoneNumber}
              </Text>
            )}
          </View>
          <ActionButton
  onPress={handleSubmit}
  disabled={!isValid || loading}
>
  Send Code
</ActionButton>
        </>
      )}
    </Formik>
  );
}
