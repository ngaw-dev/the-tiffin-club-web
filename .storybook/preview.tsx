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
        mobile: { name: "Mobile", styles: { width: "390px", height: "844px" } },
        tablet: { name: "Tablet", styles: { width: "820px", height: "1180px" } },
        desktop: { name: "Desktop", styles: { width: "1280px", height: "900px" } },
      },
      defaultViewport: "desktop",
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
