import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface CardStoryArgs {
  title: string
  description: string
  body: string
  footer: string
}

const meta: Meta<CardStoryArgs> = {
  title: 'UI/Card',
  component: Card,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    body: { control: 'text' },
    footer: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<CardStoryArgs>

export const Default: Story = {
  args: {
    title: 'Order #128',
    description: 'Weekly tiffin plan',
    body: '6 meals · delivered Tue–Sun',
    footer: 'Next delivery: tomorrow',
  },
  render: ({ title, description, body, footer }) => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">{footer}</CardFooter>
    </Card>
  ),
}
