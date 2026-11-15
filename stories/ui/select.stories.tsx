import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
}

export default meta
type Story = StoryObj<typeof Select>

const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

export const Default: Story = {
  render: () => (
    <Select defaultValue="Lunch">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Choose a meal" />
      </SelectTrigger>
      <SelectContent>
        {meals.map((meal) => (
          <SelectItem key={meal} value={meal}>
            {meal}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>()
    return (
      <div className="grid max-w-xs gap-2">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a meal" />
          </SelectTrigger>
          <SelectContent>
            {meals.map((meal) => (
              <SelectItem key={meal} value={meal}>
                {meal}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">Selected: {value ?? 'none'}</p>
      </div>
    )
  },
}
