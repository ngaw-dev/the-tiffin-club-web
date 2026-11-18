// app/(home)/blocks/how-it-works.tsx
import type { ContactInfo } from "@/lib/brand";

const KITCHEN_IMG =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=70";

interface HowItWorksProps {
  windowLabel: string | null;
  contact: ContactInfo;
}

export function HowItWorks({ windowLabel, contact }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-[var(--section-gap-s)]">
      <div className="grid gap-[var(--space-2xl)] lg:grid-cols-[5fr_7fr] lg:items-center">
        <div
          data-slot="kitchen"
          data-alt="Meals being prepared in the kitchen"
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={KITCHEN_IMG}
            alt="Meals being prepared in the kitchen"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-section">One dish, three steps</h2>
          <ol className="mt-[var(--space-xl)] space-y-[var(--space-xl)]">
            {[
              ...(windowLabel
                ? [
                    {
                      title: `Order by ${windowLabel.split("-")[1]}`,
                      body: `Today's menu goes live at ${windowLabel.split("-")[0]}. Order any time until ${windowLabel.split("-")[1]}, so decisions stay simple.`,
                    },
                  ]
                : [
                    {
                      title: "Place your order",
                      body: "Today's menu goes live each morning and ordering stays open all day, so decisions stay simple.",
                    },
                  ]),
              {
                title: "Pickup or delivery",
                body: `Collect from us${contact.pickupWindow ? ` between ${contact.pickupWindow}` : ""}, or get it delivered. No delivery fees.`,
              },
              {
                title: "Pay in person",
                body: "No cards online. Pay when you collect, or when we knock on your door.",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-[var(--space-lg)]">
                <span
                  aria-hidden
                  className="font-display text-xl font-semibold text-primary ttc-num"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-[var(--space-2xs)] max-w-md leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
