import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccordionIndicator } from "@/components/shadcnblocks/accordion-indicator";

const meta: Meta<typeof AccordionIndicator> = {
  title: "Blocks/Accordion Indicator",
  component: AccordionIndicator,
};

export default meta;
type Story = StoryObj<typeof AccordionIndicator>;

/**
 * The indicator reads open state from an ancestor aria-expanded, so each
 * state is rendered inside a plain trigger with that attribute set.
 */
function IndicatorRow({
  "aria-expanded": expanded,
  variant,
  shape,
}: {
  "aria-expanded": boolean;
  variant?: "plus" | "chevron" | "chevron-right";
  shape?: "none" | "square" | "circle";
}) {
  return (
    <span aria-expanded={expanded} className="flex items-center gap-2 text-sm">
      {expanded ? "Expanded" : "Collapsed"}
      <AccordionIndicator variant={variant} shape={shape} />
    </span>
  );
}

export const Plus: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <IndicatorRow aria-expanded={false} />
      <IndicatorRow aria-expanded />
    </div>
  ),
};

export const PlusSquare: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <IndicatorRow aria-expanded={false} variant="plus" shape="square" />
      <IndicatorRow aria-expanded variant="plus" shape="square" />
    </div>
  ),
};

export const Chevron: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <IndicatorRow aria-expanded={false} variant="chevron" />
      <IndicatorRow aria-expanded variant="chevron" />
    </div>
  ),
};

export const ChevronRightCircle: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <IndicatorRow aria-expanded={false} variant="chevron-right" shape="circle" />
      <IndicatorRow aria-expanded variant="chevron-right" shape="circle" />
    </div>
  ),
};
