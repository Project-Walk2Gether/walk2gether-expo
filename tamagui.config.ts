import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

// Dark background color:
// #131b2e

export const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
  },
});

export default tamaguiConfig;

export type TamaguiConfig = typeof tamaguiConfig;
export type TamaguiTheme = typeof tamaguiConfig.themes.light;

declare module "tamagui" {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}
