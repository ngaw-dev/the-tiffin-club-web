import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const meta: Meta<typeof Accordion> = {
  title: "UI/Accordion",
  component: Accordion,
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const render = (defaultValue?: string) => () => (
  <Accordion type="single" collapsible defaultValue={defaultValue} className="w-full max-w-md">
    <AccordionItem value="faq-1">
      <AccordionTrigger>When does ordering open?</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        The Ordering Window opens at 5pm each day and closes at Cutoff.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="faq-2">
      <AccordionTrigger>Can I cancel my order?</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Yes — cancel from your order link any time before the day&apos;s Cutoff.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export const Collapsed: Story = { render: render() };
export const FirstOpen: Story = { render: render("faq-1") };
