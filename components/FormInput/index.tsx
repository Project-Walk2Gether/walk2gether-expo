import { COLORS } from "@/styles/colors";
import React, { ReactNode } from "react";
import { Input, styled, XStack } from "tamagui";
import { FormControl } from "../FormControl";

const StyledInput = styled(Input, {
  width: "100%",
  backgroundColor: COLORS.background,
  color: COLORS.text,
  borderRadius: 10,
  borderWidth: 1,
  focusStyle: {
    borderColor: COLORS.primary,
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
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
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
  leftAccessory,
  rightAccessory,
  ...props
}: Props) {
  return (
    <FormControl
      error={error}
      touched={touched}
      label={label}
      required={required}
    >
      {leftAccessory || rightAccessory ? (
        <XStack width={width} alignItems="center">
          {leftAccessory && (
            <XStack marginRight="$2" alignItems="center">
              {leftAccessory}
            </XStack>
          )}
          <StyledInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            flex={1}
            borderColor={error && touched ? COLORS.error : COLORS.primary}
            {...props}
          />
          {rightAccessory && (
            <XStack marginLeft="$2" alignItems="center">
              {rightAccessory}
            </XStack>
          )}
        </XStack>
      ) : (
        <StyledInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          width={width}
          borderColor={error && touched ? COLORS.error : COLORS.primary}
          {...props}
        />
      )}
    </FormControl>
  );
}
