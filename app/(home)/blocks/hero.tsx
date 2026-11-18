// app/(home)/blocks/hero.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Counter-hero text block: the live menu card beside it is the hero visual,
 * so this stays a head, one sentence and the two actions — nothing more.
 */
export function Hero({ windowLabel }: { windowLabel: string | null }) {
  return (
    <div>
      <h1 className="text-display-s leading-[1.05]">Today&apos;s meal, ordered simply.</h1>
      <p className="lead mt-[var(--space-lg)] text-muted-foreground">
        {windowLabel
          ? `One kitchen, one honest home-style tiffin a day. Order by ${windowLabel.split("-")[1]}, pick up or get it delivered in Wellington.`
          : "One kitchen, one honest home-style tiffin a day. Pick up or get it delivered in Wellington."}
      </p>
      <div className="mt-[var(--space-xl)] flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href="#todays-menu">Order today&apos;s meal</a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/#how-it-works">How it works</Link>
        </Button>
      </div>
    </div>
  );
}
