"use client";

import { useEffect, useRef, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { AccordionIndicator } from "@/components/shadcnblocks/accordion-indicator";

export const title = "Grouped with Gliding Highlight";

const items = [
  {
    id: "themes",
    title: "Custom themes",
    content:
      "Pick a base palette and adjust radius, fonts and spacing. Themes apply to every page instantly.",
  },
  {
    id: "domains",
    title: "Custom domains",
    content:
      "Point a CNAME at us and an SSL certificate is issued automatically within a few minutes.",
  },
  {
    id: "embeds",
    title: "Embeds",
    content:
      "Drop any page into another site with a single script tag. Embeds inherit the host page width.",
  },
  {
    id: "analytics",
    title: "Analytics",
    content:
      "Privacy-friendly visit counts, top pages and referrers, with no cookie banner required.",
  },
];

type Box = { top: number; height: number };

const Example = () => {
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

  return (
    <div
      className="relative w-full max-w-md rounded-xl border bg-background p-1.5"
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
      <Accordion className="relative" collapsible type="single">
        {items.map((item) => (
          <AccordionItem
            className="px-3 not-last:border-b-0"
            key={item.id}
            value={item.id}
          >
            <AccordionTrigger className="items-center hover:no-underline [&>svg]:hidden!">
              {item.title}
              <AccordionIndicator className="ml-auto" variant="chevron" />
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Example;
