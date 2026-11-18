"use client";

import { BadgeCheck, Check, ChefHat, PackageCheck, ShoppingBag, Truck } from "lucide-react";

import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import type { Fulfilment, OrderStatus } from "@/lib/types";

const pickupSteps = [
  { value: "placed", title: "Placed", icon: ShoppingBag },
  { value: "confirmed", title: "Confirmed", icon: BadgeCheck },
  { value: "ready_for_pickup", title: "Ready for pickup", icon: ChefHat },
  { value: "completed", title: "Picked up", icon: PackageCheck },
] as const;

const deliverySteps = [
  { value: "placed", title: "Placed", icon: ShoppingBag },
  { value: "confirmed", title: "Confirmed", icon: BadgeCheck },
  { value: "out_for_delivery", title: "Out for delivery", icon: Truck },
  { value: "completed", title: "Delivered", icon: PackageCheck },
] as const;

/**
 * Read-only progress of an order through its fulfilment pipeline.
 * Steps vary by fulfilment; cancelled orders keep the stepper dimmed.
 */
export function FulfilmentStepper({
  status,
  fulfilment,
}: {
  status: OrderStatus;
  fulfilment: Fulfilment;
}) {
  const steps = fulfilment === "pickup" ? pickupSteps : deliverySteps;
  // Cancelled orders stay at whatever step they reached; we just dim the whole thing.
  const currentValue = steps.some((s) => s.value === status) ? status : "placed";

  return (
    <Stepper
      value={currentValue}
      nonInteractive
      className={status === "cancelled" ? "w-full opacity-50" : "w-full"}
    >
      <StepperList className="max-sm:flex-col max-sm:items-start max-sm:gap-1">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <StepperItem
              key={step.value}
              value={step.value}
              className="max-sm:flex-col max-sm:flex-none"
            >
              <StepperTrigger>
                <StepperIndicator>
                  {(state) =>
                    state === "completed" ? (
                      <Check className="size-4 text-primary" />
                    ) : (
                      <Icon className="size-4 text-primary" />
                    )
                  }
                </StepperIndicator>
                <StepperTitle>{step.title}</StepperTitle>
              </StepperTrigger>
              {/* Plain defect fix (Hallmark pass): the inactive connector's
                  bg-border is invisible on the docket's paper-2 well (ink at
                  30% keeps the track continuous), and a wrapped title could
                  squeeze the connector to zero width. */}
              <StepperSeparator className="mx-3 min-w-6 max-sm:mx-0 max-sm:mb-1 max-sm:ml-3.5 max-sm:h-4 max-sm:w-px data-[state=inactive]:bg-ink/30" />
            </StepperItem>
          );
        })}
      </StepperList>
    </Stepper>
  );
}
