"use client";

/** Simple geometric icons so the UI never leans on emoji. */
function OptionIcon({ name }: { name: "bag" | "scooter" }) {
  const cls = "h-5 w-5 text-primary";
  if (name === "scooter") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={cls}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="5.5" cy="17.5" r="2.5" />
        <circle cx="18.5" cy="17.5" r="2.5" />
        <path d="M8 17.5h8M12 17.5 9 8H6.5" />
        <path d="M12 17.5l3-6h3.5" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cls}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function FulfilmentOption({
  selected,
  onSelect,
  icon,
  title,
  detail,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: "bag" | "scooter";
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`border p-5 text-left transition hover:-translate-y-0.5 ${
        selected
          ? "border-primary bg-primary/8"
          : "border-border bg-background hover:bg-secondary/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <OptionIcon name={icon} />
        {/* Selection reads by fill and border, never a status dot. */}
        <span
          aria-hidden
          className={`h-2.5 w-2.5 rounded-full ${selected ? "bg-primary" : "border border-border"}`}
        />
      </div>
      <p className="mt-2 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </button>
  );
}

/** Checkout section: choose pickup or delivery. */
export function FulfilmentSelector({
  fulfilment,
  onSelect,
  pickupDetail,
}: {
  fulfilment: "pickup" | "delivery";
  onSelect: (next: "pickup" | "delivery") => void;
  pickupDetail: string | null;
}) {
  return (
    <section className="border-t border-border pt-6">
      <h2 className="font-display text-title">Pickup or delivery?</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <FulfilmentOption
          selected={fulfilment === "pickup"}
          onSelect={() => onSelect("pickup")}
          icon="bag"
          title="Pickup"
          detail={pickupDetail ?? "Pay in person."}
        />
        <FulfilmentOption
          selected={fulfilment === "delivery"}
          onSelect={() => onSelect("delivery")}
          icon="scooter"
          title="Delivery"
          detail="We time the run. No delivery fees. Pay in person."
        />
      </div>
    </section>
  );
}
