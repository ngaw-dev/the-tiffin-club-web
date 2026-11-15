"use client";

import { Button } from "@/components/ui/button";

/**
 * Shared +/− control used on today's menu and at checkout.
 * Quantity range is 0–20 per the order API.
 */
export function QuantityStepper({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-background">
      <Button
        type="button"
        variant="ghost"
        aria-label={`Decrease ${label}`}
        disabled={disabled || value === 0}
        onClick={() => onChange(value - 1)}
        className="h-11 w-11 rounded-l-lg rounded-r-none border-0 text-lg font-semibold text-secondary-foreground hover:bg-secondary disabled:opacity-40"
      >
        −
      </Button>
      <span aria-live="polite" className="w-10 text-center font-semibold ttc-num">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        aria-label={`Increase ${label}`}
        disabled={disabled || value >= 20}
        onClick={() => onChange(value + 1)}
        className="h-11 w-11 rounded-r-lg rounded-l-none border-0 text-lg font-semibold text-secondary-foreground hover:bg-secondary disabled:opacity-40"
      >
        +
      </Button>
    </div>
  );
}
