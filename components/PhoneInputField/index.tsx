import { COLORS } from "@/styles/colors";
import PhoneInput, {
  PhoneInputProps,
} from "@linhnguyen96114/react-native-phone-input";
import React, { forwardRef, useImperativeHandle } from "react";

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

export const PhoneInputField = forwardRef<typeof PhoneInput, Props>(
  (props, ref) => {
    const phoneInputRef = React.useRef(null);

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
        <View
          borderWidth={1}
          borderColor={touched && error ? COLORS.error : COLORS.primary}
          borderRadius={10}
          overflow="hidden"
        >
          <PhoneInput
            ref={phoneInputRef}
            defaultValue={defaultValue}
            defaultCode={defaultCode}
            layout={layout}
            onChangeText={onChangeText}
            onChangeFormattedText={onChangeFormattedText}
            containerStyle={{
              width: "100%",
              paddingLeft: 10,
              height: 48,
              borderWidth: 0, // Remove the internal borders since we have one on the container
              backgroundColor: COLORS.background,
            }}
            placeholder="Enter your phone number"
            flagButtonStyle={{
              padding: 0,
              width: "auto",
            }}
            textContainerStyle={{
              paddingRight: 0,
              paddingVertical: 0,
              backgroundColor: COLORS.background,
            }}
            textInputStyle={{
              height: 50,
              marginLeft: 5,
              borderBottomWidth: 0,
              paddingVertical: 0,
              fontSize: 16,
              color: COLORS.text,
            }}
            textInputProps={{
              placeholderTextColor: COLORS.textMuted,
            }}
            codeTextStyle={{
              color: COLORS.text,
            }}
          />
        </View>
      </FormControl>
    );
  }
);
