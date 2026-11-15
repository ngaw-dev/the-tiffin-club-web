import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
interface DialogStoryArgs {
  title: string
  description: string
}

const meta: Meta<DialogStoryArgs> = {
  title: 'UI/Dialog',
  component: DialogTrigger,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<DialogStoryArgs>

export const Default: Story = {
  args: {
    title: 'Cancel subscription?',
    description:
      'Your remaining tiffins this week will still be delivered. You can resubscribe anytime.',
  },
  render: ({ title, description }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Keep subscription</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
