import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { Formik } from "formik";
import { useCallback, useRef, useState } from "react";
import PhoneInput from "react-native-phone-number-input";
import { Text, View } from "tamagui";
import * as yup from "yup";
import { ActionButton } from "../../ActionButton";

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
  const { showMessage } = useFlashMessage();

  const { sendPhoneVerificationCode } = useAuth();

  const onSubmit = useCallback(
    async (values: SignInSchema) => {
      try {
        setLoading(true);
        const id = await sendPhoneVerificationCode(values.formattedPhoneNumber);
        onPhoneVerified(id, values.formattedPhoneNumber);
      } catch (error: any) {
        // TODO: we should type this error explicitly
        showMessage(error.message, "error");
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
                padding: 0,
                margin: 0,
              }}
              flagButtonStyle={{
                padding: 0,
                width: "auto",
              }}
              textContainerStyle={{
                paddingLeft: 10,
                paddingRight: 0,
                borderRadius: 10,
                paddingVertical: 8,
                backgroundColor: "transparent",
                flex: 1,
              }}
              textInputStyle={{
                height: 50,
                marginLeft: 10,
                borderBottomColor: "#ddd",
                borderBottomWidth: 1,
                paddingHorizontal: 15,
                fontSize: 16,
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
            label="Send Code"
            onPress={handleSubmit}
            disabled={!isValid || loading}
          ></ActionButton>
        </>
      )}
    </Formik>
  );
}
