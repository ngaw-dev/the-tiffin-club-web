import type { StorybookConfig } from "@storybook/nextjs-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  // Note: `vitePlugins` is silently ignored by this framework — the Tailwind
  // plugin must be merged via viteFinal or styles compile without utilities.
  async viteFinal(config) {
    return mergeConfig(config, { plugins: [tailwindcss()] });
  },
};

export default config;
