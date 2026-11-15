import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { type: 'email', placeholder: 'you@example.com' },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { placeholder: 'Disabled', disabled: true },
}

export const Invalid: Story = {
  args: { type: 'email', defaultValue: 'not-an-email', 'aria-invalid': true },
}
