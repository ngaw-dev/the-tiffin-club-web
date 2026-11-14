import type { ContactInfo } from "@/lib/brand";

const KITCHEN_IMG =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=70";

interface HowItWorksProps {
  windowLabel: string | null;
  contact: ContactInfo;
}

export function HowItWorks({ windowLabel, contact }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-14">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">How it works</h2>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
        <div className="group overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={KITCHEN_IMG}
            alt="Meals being prepared in the kitchen"
            className="aspect-[3/4] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <ol className="space-y-8">
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
            <li key={step.title} className="flex gap-5">
              <span
                aria-hidden
                className="font-display text-3xl font-semibold text-primary ttc-num"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
