"use client";

// app/(home)/blocks/faq.tsx

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { AccordionIndicator } from "@/components/shadcnblocks/accordion-indicator";

export function Faq({ windowLabel }: { windowLabel: string | null }) {
  const items = [
    ...(windowLabel
      ? [
          {
            id: "ordering-window",
            q: "What time can I order?",
            a: `Ordering runs ${windowLabel}, every day. After ${windowLabel.split("-")[1]} the kitchen locks in the prep list.`,
          },
        ]
      : []),
    {
      id: "change-cancel",
      q: "Can I change or cancel my order?",
      a: `Yes. You can update any detail or cancel${
        windowLabel ? ` until the ${windowLabel.split("-")[1]} cutoff` : ""
      } from the My order page. After that, give us a call.`,
    },
    {
      id: "payment",
      q: "How do I pay?",
      a: "In person, at pickup or delivery. No online payment. What you see on your order total is what you pay.",
    },
    {
      id: "delivery",
      q: "Where do you deliver?",
      a: "We deliver to selected suburbs — the list is in checkout. We time the delivery run, so there's no need to pick a slot.",
    },
  ];

  return (
    <section id="faq" className="scroll-mt-24 pb-[var(--section-gap-s)]">
      {/* Rows: the head sits beside the questions, parted by hairlines. */}
      <div className="grid gap-[var(--space-2xl)] lg:grid-cols-[5fr_7fr]">
        <h2 className="text-section">Common questions</h2>
        <Accordion
          type="single"
          collapsible
          className="border-t border-border [&_[data-slot=accordion-item]]:border-border"
        >
          {items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="px-[var(--space-md)] motion-safe:transition-colors motion-safe:duration-200 data-[state=open]:bg-secondary/60"
            >
              <AccordionTrigger className="items-center font-medium hover:no-underline [&>svg]:hidden!">
                {item.q}
                <AccordionIndicator className="ml-auto" variant="chevron" />
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
