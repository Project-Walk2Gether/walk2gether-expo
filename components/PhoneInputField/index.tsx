import { COLORS } from "@/styles/colors";
import React, { forwardRef, useImperativeHandle } from "react";
import PhoneInput, { PhoneInputProps } from "react-native-phone-number-input";
import { View } from "tamagui";
import { FormControl } from "../FormControl";

interface Props {
  defaultValue?: string;
  defaultCode?: PhoneInputProps["defaultCode"];
  layout?: "first" | "second";
  onChangeText?: (text: string) => void;
  onChangeFormattedText?: (text: string) => void;
  error?: string;
  touched?: boolean;
  label?: string;
  required?: boolean;
}

export const PhoneInputField = forwardRef<PhoneInput, Props>((props, ref) => {
  const phoneInputRef = React.useRef<PhoneInput>(null);

  // Forward the ref to the PhoneInput component
  useImperativeHandle(ref, () => phoneInputRef.current!);

  const {
    defaultValue,
    defaultCode = "US",
    layout = "first",
    onChangeText,
    onChangeFormattedText,
    error,
    touched,
    label,
    required,
  } = props;

  return (
    <FormControl
      error={error}
      touched={touched}
      label={label}
      required={required}
    >
      <View>
        {/* @ts-ignore-line - bug in the library */}
        <PhoneInput
          ref={phoneInputRef}
          defaultValue={defaultValue}
          defaultCode={defaultCode}
          layout={layout}
          onChangeText={onChangeText}
          onChangeFormattedText={onChangeFormattedText}
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
            height: 40,
            marginLeft: 10,
            borderBottomColor: COLORS.primary,
            borderBottomWidth: 1,
            paddingHorizontal: 15,
            fontSize: 16,
          }}
          codeTextStyle={{
            color: COLORS.text,
          }}
        />
      </View>
    </FormControl>
  );
});
