import type { Preview } from "@storybook/nextjs-vite";
import { sb } from "storybook/test";
import "../app/globals.css";

import { ForcedThemeProvider } from "./theme-provider";

// Mirror the app's root layout so pages render with the same shell
// (fonts/theme vars live on <body> classes in app/layout.tsx).
const bodyClasses =
  "min-h-full flex flex-col bg-background font-sans text-foreground";

// Fixture-backed mocks for data/auth-coupled components (orders page etc.).
// Note: extensionless resolution fails here, hence the explicit .ts
sb.mock(import("../lib/api.ts"));
sb.mock(import("../lib/account.ts"));
sb.mock(import("@clerk/nextjs"));

type Theme = "light" | "dark";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    viewport: {
      viewports: {
        xs: { name: "XS (375×667, < sm)", styles: { width: "375px", height: "667px" } },
        sm: { name: "SM (640×900, ≥ sm)", styles: { width: "640px", height: "900px" } },
        md: { name: "MD (768×1024, ≥ md)", styles: { width: "768px", height: "1024px" } },
        lg: { name: "LG (1024×1100, ≥ lg)", styles: { width: "1024px", height: "1100px" } },
        xl: { name: "XL (1280×900, ≥ xl)", styles: { width: "1280px", height: "900px" } },
        "2xl": { name: "2XL (1536×1000, ≥ 2xl)", styles: { width: "1536px", height: "1000px" } },
      },
      defaultViewport: "responsive",
    },
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
        <body className={bodyClasses}>
          <main className="flex-1">
            <Story />
          </main>
        </body>
      </ForcedThemeProvider>
    ),
  ],
};
