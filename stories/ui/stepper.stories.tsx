import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Check, CreditCard, Truck, User } from 'lucide-react'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

const meta: Meta<typeof Stepper> = {
  title: 'UI/Stepper',
  component: Stepper,
}

export default meta
type Story = StoryObj<typeof Stepper>

const steps = [
  { value: 'account', title: 'Account', icon: User },
  { value: 'shipping', title: 'Shipping', icon: Truck },
  { value: 'payment', title: 'Payment', icon: CreditCard },
  { value: 'done', title: 'Done', icon: Check },
]

const render = (defaultValue: string) => () => (
  <Stepper defaultValue={defaultValue} className="w-full max-w-2xl">
    <StepperList>
      {steps.map((step) => {
        const Icon = step.icon
        return (
          <StepperItem key={step.value} value={step.value}>
            <StepperTrigger>
              <StepperIndicator>
                {(state) =>
                  state === 'completed' ? <Check className="size-4" /> : <Icon className="size-4" />
                }
              </StepperIndicator>
              <StepperTitle>{step.title}</StepperTitle>
            </StepperTrigger>
            <StepperSeparator className="mx-3" />
          </StepperItem>
        )
      })}
    </StepperList>
  </Stepper>
)

export const FirstStep: Story = { render: render('account') }
export const SecondStep: Story = { render: render('shipping') }
export const LastStep: Story = { render: render('done') }

export const NonInteractive: Story = {
  render: () => (
    <Stepper value="payment" nonInteractive className="w-full max-w-2xl">
      <StepperList>
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <StepperItem key={step.value} value={step.value}>
              <StepperTrigger>
                <StepperIndicator>
                  {(state) =>
                    state === 'completed' ? (
                      <Check className="size-4" />
                    ) : (
                      <Icon className="size-4" />
                    )
                  }
                </StepperIndicator>
                <StepperTitle>{step.title}</StepperTitle>
              </StepperTrigger>
              <StepperSeparator className="mx-3" />
            </StepperItem>
          )
        })}
      </StepperList>
    </Stepper>
  ),
}
