import { LaunchArguments } from "react-native-launch-arguments";
const args = LaunchArguments.value();
export const isDetox = !!args.detoxServer;
