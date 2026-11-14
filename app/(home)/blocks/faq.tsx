"use client";

import { useEffect, useRef, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { AccordionIndicator } from "@/components/shadcnblocks/accordion-indicator";

type Box = { top: number; height: number };

export function Faq({ windowLabel }: { windowLabel: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  // Track the hovered item's size so the highlight follows it while it opens.
  useEffect(() => {
    if (!hovered || !ref.current) {
      setBox(null);
      return;
    }
    const root = ref.current;
    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const rect = hovered.getBoundingClientRect();
      setBox({ top: rect.top - rootRect.top, height: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(hovered);
    return () => observer.disconnect();
  }, [hovered]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-slot="accordion-item"]',
    );
    if (item && item !== hovered) setHovered(item);
  };

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
    <section id="faq" className="scroll-mt-24 pb-16">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">Common questions</h2>
      <div
        className="relative mt-6 w-full rounded-xl border border-border bg-card p-1.5"
        onPointerLeave={() => setHovered(null)}
        onPointerMove={handlePointerMove}
        ref={ref}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1.5 rounded-lg bg-muted transition-[top,height,opacity] duration-200 ease-out"
          style={{
            top: box?.top ?? 0,
            height: box?.height ?? 0,
            opacity: box ? 1 : 0,
          }}
        />
        <Accordion type="single" collapsible className="relative">
          {items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="px-4 py-1 not-last:border-b-0"
            >
              <AccordionTrigger className="items-center font-medium hover:no-underline [&>svg]:hidden!">
                {item.q}
                <AccordionIndicator className="ml-auto" variant="chevron" />
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
