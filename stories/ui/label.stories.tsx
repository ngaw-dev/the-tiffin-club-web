import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Label } from '@/components/ui/label'

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: { children: 'Label', htmlFor: 'example' },
}

export const WithInput: Story = {
  render: () => (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="plan">Plan</Label>
      <input id="plan" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" placeholder="Weekly" />
    </div>
  ),
}
