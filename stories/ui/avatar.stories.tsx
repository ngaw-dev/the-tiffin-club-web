import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
}

export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=80&q=40"
        alt="Tiffin meal"
      />
      <AvatarFallback>TC</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>TC</AvatarFallback>
    </Avatar>
  ),
}
