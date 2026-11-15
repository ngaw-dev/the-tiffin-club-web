import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import StepperIcons1 from '@/components/stepper-icons-1'

const meta: Meta<typeof StepperIcons1> = {
  title: 'Blocks/Stepper Icons 1',
  component: StepperIcons1,
}

export default meta
type Story = StoryObj<typeof StepperIcons1>

export const Default: Story = {
  render: () => (
    <div className="p-8">
      <StepperIcons1 />
    </div>
  ),
}
