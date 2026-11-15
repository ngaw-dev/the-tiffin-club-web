import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FulfilmentStepper } from '@/app/(home)/fulfilment-stepper'

const meta: Meta<typeof FulfilmentStepper> = {
  title: 'Domain/Fulfilment Stepper',
  component: FulfilmentStepper,
}

export default meta
type Story = StoryObj<typeof FulfilmentStepper>

const render =
  (status: Parameters<typeof FulfilmentStepper>[0]['status'], fulfilment: 'pickup' | 'delivery') =>
  () => (
    <div className="p-8">
      <FulfilmentStepper status={status} fulfilment={fulfilment} />
    </div>
  )

export const PickupPlaced: Story = { render: render('placed', 'pickup') }
export const PickupConfirmed: Story = { render: render('confirmed', 'pickup') }
export const PickupReady: Story = { render: render('ready_for_pickup', 'pickup') }
export const PickupCompleted: Story = { render: render('completed', 'pickup') }
export const DeliveryPlaced: Story = { render: render('placed', 'delivery') }
export const DeliveryConfirmed: Story = { render: render('confirmed', 'delivery') }
export const DeliveryOut: Story = { render: render('out_for_delivery', 'delivery') }
export const DeliveryCompleted: Story = { render: render('completed', 'delivery') }
/** Cancelled orders dim the whole stepper. */
export const Cancelled: Story = { render: render('cancelled', 'pickup') }
