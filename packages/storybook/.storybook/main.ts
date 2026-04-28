import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "url";
import path from "path";

// ESM-compatible __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],

  addons: [
    "@storybook/addon-essentials",
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  /**
   * Map workspace package names to their source directories so Storybook's
   * Vite bundler resolves them without needing a prior build step.
   *
   * __dirname here is packages/storybook/.storybook, so ../../<pkg>/src
   * resolves to packages/<pkg>/src.
   */
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
