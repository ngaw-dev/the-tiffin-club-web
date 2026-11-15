import type { Preview } from "@storybook/nextjs-vite";
import { sb } from "storybook/test";
import "../app/globals.css";

import { ForcedThemeProvider } from "./theme-provider";

// Fixture-backed mocks for data/auth-coupled components (orders page etc.).
// Note: extensionless resolution fails here, hence the explicit .ts
sb.mock(import("../lib/api.ts"));
sb.mock(import("../lib/account.ts"));
sb.mock(import("@clerk/nextjs"));

type Theme = "light" | "dark";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    a11y: {
      test: "error",
    },
  },
  globalTypes: {
    theme: {
      description: "Light / dark theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ForcedThemeProvider theme={(context.globals.theme as Theme) ?? "light"}>
        <div className="p-8">
          <Story />
        </div>
      </ForcedThemeProvider>
    ),
  ],
};

export default preview;
