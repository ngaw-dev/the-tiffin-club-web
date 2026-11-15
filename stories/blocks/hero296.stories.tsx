import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Hero296 } from '@/components/hero296'

const meta: Meta<typeof Hero296> = {
  title: 'Blocks/Hero 296',
  component: Hero296,
}

export default meta
type Story = StoryObj<typeof Hero296>

export const Default: Story = {
  args: {
    heading: 'Home-style Indian meals, delivered in steel tiffins',
    description:
      'Order before the daily Cutoff and pick up a fresh, home-cooked tiffin on your way home — or have it delivered.',
    buttons: {
      primary: { text: 'Order today\u2019s tiffin', url: '#' },
      secondary: { text: 'See the menu', url: '#' },
    },
  },
}

export const Mobile: Story = {
  ...Default,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
