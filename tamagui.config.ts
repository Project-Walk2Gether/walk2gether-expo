import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";
import { COLORS } from "./styles/colors";

const customTheme = {
  primary: COLORS.primary,
  secondary: COLORS.secondary,
  tertiary: COLORS.tertiary,
  background: COLORS.background,
  card: COLORS.card,
  subtle: COLORS.subtle,
  accent1: COLORS.accent1,
  accent2: COLORS.accent2,
  accent3: COLORS.accent3,
};

export const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      ...customTheme,
    },
    dark: {
      ...config.themes.dark,
      ...customTheme, // You may want to customize for dark mode
    },
  },
});

export default tamaguiConfig;

export type TamaguiConfig = typeof tamaguiConfig;
export type TamaguiTheme = typeof tamaguiConfig.themes.light;

declare module "tamagui" {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}
