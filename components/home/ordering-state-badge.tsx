import { STATE_CLASSES, STATE_LABEL } from "@/lib/brand";
import type { OrderingWindow } from "@/lib/types";

/** Ordering-state badge: always a text label (never color alone). */
export function OrderingStateBadge({
  ordering,
  className = "",
}: {
  ordering: OrderingWindow;
  className?: string;
}) {
  const { state } = ordering;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${STATE_CLASSES[state] ?? STATE_CLASSES.closed} ${className}`}
    >
      <span aria-hidden>
        {state === "open" ? "●" : state === "closing_soon" ? "◐" : "✕"}
      </span>
      {STATE_LABEL[state] ?? "Ordering closed"}
    </span>
  );
}
