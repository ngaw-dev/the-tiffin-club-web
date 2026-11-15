import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AccordionGroup2 from '@/components/accordion-group-2'

const meta: Meta<typeof AccordionGroup2> = {
  title: 'Blocks/Accordion Group 2',
  component: AccordionGroup2,
}

export default meta
type Story = StoryObj<typeof AccordionGroup2>

export const Default: Story = {
  render: () => (
    <div className="p-8">
      <AccordionGroup2 />
    </div>
  ),
}
