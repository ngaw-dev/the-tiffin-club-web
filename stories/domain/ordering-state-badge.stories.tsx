import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OrderingStateBadge } from '@/app/(home)/ordering-state-badge'
import { orderingWindows } from '../fixtures/orders'

const meta: Meta<typeof OrderingStateBadge> = {
  title: 'Domain/Ordering State Badge',
  component: OrderingStateBadge,
}

export default meta
type Story = StoryObj<typeof OrderingStateBadge>

export const Open: Story = {
  render: () => <OrderingStateBadge ordering={orderingWindows.open} />,
}

export const ClosingSoon: Story = {
  render: () => <OrderingStateBadge ordering={orderingWindows.closing_soon} />,
}

export const Closed: Story = {
  render: () => <OrderingStateBadge ordering={orderingWindows.closed} />,
}
