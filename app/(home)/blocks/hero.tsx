import { Hero296 } from "@/components/hero296";

const AVATARS = [
  {
    src: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar1.webp",
    alt: "Jack Walsh",
  },
  {
    src: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar2.webp",
    alt: "Ilze Pērkone",
  },
  {
    src: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar3.webp",
    alt: "Vernon Desilets",
  },
  {
    src: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar4.webp",
    alt: "Lín Wàngshū",
  },
  {
    src: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar5.webp",
    alt: "Rajesh Bhatt",
  },
];

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
      reviews={{
        count: 206,
        rating: 4.9,
        avatars: AVATARS,
      }}
      byline="Trusted by tiffin lovers across Wellington"
    />
  );
}
