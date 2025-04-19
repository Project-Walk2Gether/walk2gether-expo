import { useAuth } from "context/AuthContext";
import { Formik } from "formik";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { Button, Text, View } from "tamagui";
import * as yup from "yup";

const signInSchema = yup.object().shape({
  phoneNumber: yup.string().required("Phone number is required"),
  formattedPhoneNumber: yup
    .string()
    .required("Formatted phone number is required"),
});
type SignInSchema = yup.InferType<typeof signInSchema>;

interface Props {
  setVerificationCode: (verificationId: string) => void;
}

export default function PhoneForm({ setVerificationCode }: Props) {
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef<PhoneInput>(null);

  const { sendPhoneVerificationCode } = useAuth();

  const onSubmit = useCallback(
    async (values: SignInSchema) => {
      try {
        setLoading(true);
        const id = await sendPhoneVerificationCode(values.formattedPhoneNumber);
        setVerificationCode(id);
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
              textInputStyle={[styles.input]}
              codeTextStyle={{
                color: "#000",
              }}
            />
            {touched.phoneNumber && errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>
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
                Send Code
              </Text>
            )}
          </Button>
        </>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
});
