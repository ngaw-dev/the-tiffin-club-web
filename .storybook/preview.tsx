import type { Preview } from '@storybook/nextjs-vite'
import '../app/globals.css'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

type Theme = 'light' | 'dark'

const ForcedThemeProvider = ({ children, theme }: { children: ReactNode; theme: Theme }) => {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])
  return <ThemeProvider attribute="class" forcedTheme={theme}>{children}</ThemeProvider>
}

const preview: Preview = {
  parameters: {
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
      test: 'error',
    },
  },
  globalTypes: {
    theme: {
      description: 'Light / dark theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ForcedThemeProvider theme={(context.globals.theme as Theme) ?? 'light'}>
        <Story />
      </ForcedThemeProvider>
    ),
  ],
}

export default preview
