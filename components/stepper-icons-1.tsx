"use client";

import { Check, CreditCard, Truck, User } from "lucide-react";

import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";

export const title = "Custom indicator icons";

const steps = [
  { value: "account", title: "Account", icon: User },
  { value: "shipping", title: "Shipping", icon: Truck },
  { value: "payment", title: "Payment", icon: CreditCard },
  { value: "done", title: "Done", icon: Check },
];

const Example = () => (
  <Stepper defaultValue="shipping" className="w-full max-w-2xl">
    <StepperList>
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <StepperItem key={step.value} value={step.value}>
            <StepperTrigger>
              <StepperIndicator>
                {(state) =>
                  state === "completed" ? (
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
        );
      })}
    </StepperList>
  </Stepper>
);

export default Example;
