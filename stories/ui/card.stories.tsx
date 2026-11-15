import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Order #128</CardTitle>
        <CardDescription>Weekly tiffin plan</CardDescription>
      </CardHeader>
      <CardContent>
        <p>6 meals · delivered Tue–Sun</p>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Next delivery: tomorrow
      </CardFooter>
    </Card>
  ),
}
