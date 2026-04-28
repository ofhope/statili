import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],

  addons: [
    "@storybook/addon-essentials",
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  viteFinal: async (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@statili/stats": path.resolve(__dirname, "../../stats/src"),
      "@statili/forge": path.resolve(__dirname, "../../forge/src"),
      "@statili/fp": path.resolve(__dirname, "../../fp/src"),
    };
    return config;
  },
};

export default config;
