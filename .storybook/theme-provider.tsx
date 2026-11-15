import type { ReactNode } from "react";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

export type Theme = "light" | "dark";

export const ForcedThemeProvider = ({ children, theme }: { children: ReactNode; theme: Theme }) => {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  return (
    <ThemeProvider attribute="class" forcedTheme={theme}>
      {children}
    </ThemeProvider>
  );
};
