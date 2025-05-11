import { ActionButton } from "@/components/ActionButton";
import { auth_instance, crashlytics_instance } from "@/config/firebase";
import { useFlashMessage, type MessageType } from "@/context/FlashMessageContext";
import { COLORS } from "@/styles/colors";
import { writeLogIfEnabled } from "@/utils/logging";
import { Ionicons } from "@expo/vector-icons";
import { recordError } from "@react-native-firebase/crashlytics";
import { isDevice } from "expo-device";
import * as Updates from "expo-updates";
import React from "react";
import { Card, H3, Paragraph, Separator, Text, XStack, YStack } from "tamagui";
import { ErrorContext } from "./ErrorContext";

interface Props {
  children: React.ReactNode;
}
interface State {
  error: false | Error;
}

export class ErrorBoundary extends React.Component<Props & { showMessage?: (message: string, type?: MessageType) => void }, State> {
  state: { error: false | Error } = {
    error: false,
  };

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  // This is the "soft" way to handle errors. We render a flash message, and log details.
  catchError(error: Error, extraContext: any) {
    console.error({ error, trace: error.stack });
    if (this.props.showMessage) {
      this.props.showMessage(error.message, "error");
    }
    writeLogIfEnabled({
      message: `ERROR: ${error.message}`,
      metadata: { error, ...extraContext },
    });
  }

  componentDidCatch(error: any, _errorInfo: any) {
    recordError(crashlytics_instance, error);
  }

  handleReset = () => {
    if (isDevice) {
      Updates.reloadAsync();
    } else {
      if (this.props.showMessage) {
        this.props.showMessage("Developer: reload using ctrl+cmd+Z", "error");
      }
    }
  };

  render() {
    if (this.state.error) {
      console.log({ error: this.state.error });
      const errorMessage =
        typeof this.state.error === "object" && this.state.error?.message
          ? this.state.error.message
          : "Unknown error";

      return (
        <YStack
          flex={1}
          bg="#FEF7DC"
          alignItems="center"
          justifyContent="center"
          p="$4"
        >
          <Card
            width="90%"
            maxWidth={500}
            backgroundColor="white"
            borderRadius="$6"
            overflow="hidden"
            elevation={4}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={8}
          >
            <Card.Header px="$0" pb="$0">
              <XStack
                backgroundColor={COLORS.error}
                paddingVertical="$4"
                paddingHorizontal="$4"
                width="100%"
                alignItems="center"
                space="$2"
              >
                <Ionicons name="alert-circle" size={28} color="white" />
                <H3 color="white" fontWeight="bold">
                  Something went wrong
                </H3>
              </XStack>
            </Card.Header>

            <YStack p="$4" space="$4">
              <Paragraph>
                We've encountered an unexpected error. Our team has been
                notified and is working on it. Please try restarting the app.
              </Paragraph>

              <Card bg="$gray2" borderRadius="$4" marginTop="$2" padding="$3">
                <Text
                  fontSize="$2"
                  color={COLORS.error}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {errorMessage}
                </Text>
              </Card>

              <Separator my="$2" />

              <YStack gap="$2">
                <ActionButton
                  onPress={this.handleReset}
                  theme="blue"
                  color="black"
                  label="Restart App"
                  icon={<Ionicons name="refresh" size={20} />}
                />
                <ActionButton
                  onPress={() => {
                    auth_instance.signOut();
                    this.handleReset();
                  }}
                  label="Log Out"
                  icon={<Ionicons name="log-out" size={20} />}
                />
              </YStack>
            </YStack>
          </Card>
        </YStack>
      );
    } else {
      return (
        <ErrorContext.Provider value={{ catchError: this.catchError }}>
          {this.props.children}
        </ErrorContext.Provider>
      );
    }
  }
}

// Create a wrapper that uses the hook and passes it to ErrorBoundary
const ErrorBoundaryWithFlashMessage: React.FC<Props> = (props) => {
  const { showMessage } = useFlashMessage();
  return <ErrorBoundary showMessage={showMessage} {...props} />;
};

// Export a Higher-Order Component to wrap components with ErrorBoundary
export function withErrorBoundary<P extends React.JSX.IntrinsicAttributes>(
  Component: React.ComponentType<P>
) {
  return (props: P) => (
    <ErrorBoundaryWithFlashMessage>
      <Component {...props} />
    </ErrorBoundaryWithFlashMessage>
  );
}

export default ErrorBoundaryWithFlashMessage;
