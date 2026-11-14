import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AccordionIndicatorVariant = "plus" | "chevron" | "chevron-right";
type AccordionIndicatorShape = "none" | "square" | "circle";

const shapeClasses: Record<AccordionIndicatorShape, string> = {
  none: "size-4",
  square:
    "size-6 rounded-md border bg-background in-aria-expanded:border-foreground in-aria-expanded:bg-foreground in-aria-expanded:text-background",
  circle:
    "size-6 rounded-full border bg-background in-aria-expanded:border-foreground in-aria-expanded:bg-foreground in-aria-expanded:text-background",
};

// Reads the open state from the nearest [aria-expanded="true"] ancestor, so it
// works inside any AccordionTrigger (Radix, Base UI or React Aria).
function AccordionIndicator({
  variant = "plus",
  shape = "none",
  className,
  ...props
}: React.ComponentProps<"span"> & {
  variant?: AccordionIndicatorVariant;
  shape?: AccordionIndicatorShape;
}) {
  return (
    <span
      data-slot="accordion-indicator"
      data-variant={variant}
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center text-muted-foreground transition-colors duration-200 in-aria-expanded:text-foreground",
        shapeClasses[shape],
        className,
      )}
      {...props}
    >
      {variant === "plus" && (
        <>
          <span className="absolute h-[1.5px] w-2.5 rounded-full bg-current" />
          <span className="absolute h-2.5 w-[1.5px] rounded-full bg-current transition-transform duration-200 ease-out in-aria-expanded:scale-y-0" />
        </>
      )}
      {variant === "chevron" && (
        <ChevronDownIcon className="size-3.5 transition-transform duration-200 ease-out in-aria-expanded:rotate-180" />
      )}
      {variant === "chevron-right" && (
        <ChevronRightIcon className="size-3.5 transition-transform duration-200 ease-out in-aria-expanded:rotate-90" />
      )}
    </span>
  );
}

export { AccordionIndicator };
export type { AccordionIndicatorShape, AccordionIndicatorVariant };
