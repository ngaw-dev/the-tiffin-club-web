import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from '@/components/ui/badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { children: 'PLACED' } }
export const Secondary: Story = { args: { children: 'CONFIRMED', variant: 'secondary' } }
export const Destructive: Story = { args: { children: 'CANCELLED', variant: 'destructive' } }
export const Outline: Story = { args: { children: 'PICKUP', variant: 'outline' } }
