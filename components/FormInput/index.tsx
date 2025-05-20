import { COLORS } from "@/styles/colors";
import { Input, styled } from "tamagui";
import React from "react";
import { FormControl } from "../FormControl";

const StyledInput = styled(Input, {
  width: "100%",
  backgroundColor: COLORS.background,
  color: COLORS.text,
  borderRadius: 10,
  borderWidth: 1,
  focusStyle: {
    borderColor: COLORS.primary,
    // Removed the thicker border to match LocationAutocomplete
  },
});

interface Props extends React.ComponentProps<typeof StyledInput> {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  width?: number | string;
  error?: string;
  touched?: boolean;
  label?: string;
  required?: boolean;
}

export function FormInput({
  placeholder,
  value,
  onChangeText,
  width = "100%",
  error,
  touched,
  label,
  required,
  ...props
}: Props) {
  return (
    <FormControl
      error={error}
      touched={touched}
      label={label}
      required={required}
    >
      <StyledInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        width={width}
        borderColor={error && touched ? COLORS.error : COLORS.primary}
        {...props}
      />
    </FormControl>
  );
}
