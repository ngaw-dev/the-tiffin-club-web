import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface Button {
  text: string;
  url: string;
  icon?: React.ReactNode;
}
interface Buttons {
  primary?: Button;
  secondary?: Button;
}
interface Avatar {
  src: string;
  alt: string;
}

interface HeroSocialProofProps {
  heading: string;
  description: string;
  buttons?: Buttons;
  image?: Avatar;
  className?: string;
}

type Hero296Props = HeroSocialProofProps;
type Props = Partial<Hero296Props>;

const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=70",
  alt: "A home-style Indian meal served in steel tiffin containers",
};
const defaultProps: Hero296Props = {
  heading: "Introducing the world's best marketing software.",
  description:
    "Loved by marketers around the world—plan campaigns, track results, and grow faster with the tools teams actually rely on.",
  buttons: {
    primary: { text: "Get Started", url: "#" },
    secondary: { text: "View Reviews", url: "#" },
  },
  image: HERO_IMAGE,
};

const Hero296 = (props: Props) => {
  const { heading, description, buttons, image, className } = {
    ...defaultProps,
    ...props,
  };

  return (
    <section className={cn("py-12 md:py-20 lg:py-28", className)}>
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="flex flex-col gap-8 lg:max-w-xl lg:flex-1">
            <div className="flex flex-col gap-6">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-pretty md:text-5xl lg:text-6xl">
                {heading}
              </h1>
              <p className="max-w-2xl text-balance text-muted-foreground lg:text-xl">
                {description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {buttons?.primary && (
                <Button asChild size="lg" className="h-12 w-full sm:w-auto">
                  <a href={buttons.primary.url}>{buttons.primary.text}</a>
                </Button>
              )}
              {buttons?.secondary && (
                <Button asChild variant="outline" size="lg" className="h-12 w-full sm:w-auto">
                  <a href={buttons.secondary.url}>{buttons.secondary.text}</a>
                </Button>
              )}
            </div>
          </div>

          {image && (
            <div className="w-full lg:w-auto lg:max-w-md lg:flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={image.alt}
                className="aspect-[4/3] w-full rounded-xl object-cover"
                src={image.src}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { Hero296 };
