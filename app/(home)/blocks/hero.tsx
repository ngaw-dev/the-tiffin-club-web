import { Hero296 } from "@/components/hero296";

const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=70",
  alt: "A home-style Indian meal served in steel tiffin containers",
};

export function Hero({ windowLabel }: { windowLabel: string | null }) {
  return (
    <Hero296
      heading="Today's meal, ordered simply."
      description={
        windowLabel
          ? `One kitchen, one honest home-style tiffin a day. Order by ${windowLabel.split("-")[1]}, pick up or get it delivered in Wellington.`
          : "One kitchen, one honest home-style tiffin a day. Pick up or get it delivered in Wellington."
      }
      buttons={{
        primary: { text: "Order today's meal", url: "#todays-menu" },
        secondary: { text: "How it works", url: "#how-it-works" },
      }}
      image={HERO_IMAGE}
    />
  );
}
