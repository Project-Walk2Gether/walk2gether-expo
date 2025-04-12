import { nativeApplicationVersion } from "expo-application";
import * as Updates from "expo-updates";
const updateVersion = Updates.updateId?.split("-")[0] || "Development";

export const appVersion = `${nativeApplicationVersion}:${updateVersion}`;
