import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="weekly" className="max-w-md">
      <TabsList>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="one-off">One-off</TabsTrigger>
      </TabsList>
      <TabsContent value="weekly">6 tiffins per week, delivered daily.</TabsContent>
      <TabsContent value="monthly">24 tiffins per month, delivered Tue–Sun.</TabsContent>
      <TabsContent value="one-off">Single tiffin, delivered tomorrow.</TabsContent>
    </Tabs>
  ),
}
