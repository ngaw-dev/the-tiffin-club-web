import type { Preview } from '@storybook/nextjs-vite'
import '../app/globals.css'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

const ThemeDecorator = ({ children, theme }: { children: ReactNode; theme: string }) => {
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
      test: 'todo',
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
      <ThemeDecorator theme={context.globals.theme as string}>
        <Story />
      </ThemeDecorator>
    ),
  ],
}

export default preview
