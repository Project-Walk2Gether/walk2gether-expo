import { Button, ButtonProps } from "tamagui";

export default function FAB({
  icon,
  bottom = 32,
  right = 24,
  ...rest
}: ButtonProps) {
  return (
    <Button
      size="$6"
      circular
      backgroundColor="$primary"
      position="absolute"
      bottom={bottom}
      right={right}
      zIndex={100}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.15}
      shadowRadius={8}
      elevation={8}
      icon={icon}
      {...rest}
    />
  );
}
