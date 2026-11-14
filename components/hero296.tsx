import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Reviews {
  count: number;
  rating: number;
  avatars: Avatar[];
}
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
  reviews?: Reviews;
  byline?: string;
  className?: string;
}

type Hero296Props = HeroSocialProofProps;
type Props = Partial<Hero296Props>;

const person1 = {
  name: "Jack Walsh",
  firstName: "Jack",
  lastName: "Walsh",
  initials: "JW",
  email: "jack.walsh@example.com",
  username: "jackwalsh",
  role: "Product Designer",
  company: "Cartwright",
  location: "Brisbane, Australia",
  avatar: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar1.webp",
};
const person2 = {
  name: "Ilze Pērkone",
  firstName: "Ilze",
  lastName: "Pērkone",
  initials: "MK",
  email: "iperkone@example.com",
  username: "iperkone",
  role: "Brand Director",
  company: "Kivit",
  location: "Rīga, Latvia",
  avatar: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar2.webp",
};
const person3 = {
  name: "Vernon Desilets",
  firstName: "Vernon",
  lastName: "Desilets",
  initials: "VD",
  email: "vernod@example.com",
  username: "vernod",
  role: "Creative Director",
  company: "Soho Logix",
  location: "Paris, France",
  avatar: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar3.webp",
};
const person4 = {
  name: "Lín Wàngshū",
  firstName: "Lín",
  lastName: "Wangshu",
  initials: "LW",
  email: "linwang4@example.com",
  username: "liwang",
  role: "Graphic Designer",
  company: "Tenxcloud",
  location: "Shanghai, China",
  avatar: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar4.webp",
};
const person5 = {
  name: "Rajesh Bhatt",
  firstName: "Rajesh",
  lastName: "Bhatt",
  initials: "RB",
  email: "rajesh.bhatt@example.com",
  username: "rajeshbhatt",
  role: "UX Researcher",
  company: "Mindtree",
  location: "Mumbai, India",
  avatar: "https://cdn.shadcnblocks.com/shadcnblocks/image-set/modern/avatars/avatar5.webp",
};
const defaultProps: Hero296Props = {
  heading: "Introducing the world's best marketing software.",
  description:
    "Loved by marketers around the world—plan campaigns, track results, and grow faster with the tools teams actually rely on.",
  buttons: {
    primary: { text: "Get Started", url: "#" },
    secondary: { text: "View Reviews", url: "#" },
  },
  reviews: {
    count: 206,
    rating: 4.9,
    avatars: [
      { src: person1.avatar, alt: person1.name },
      { src: person2.avatar, alt: person2.name },
      { src: person3.avatar, alt: person3.name },
      { src: person4.avatar, alt: person4.name },
      { src: person5.avatar, alt: person5.name },
    ],
  },
  byline: "Trusted by teams at Arc, Notion, Raycast, and more",
};

const MAX_REVIEW_AVATARS = 5;

const Hero296 = (props: Props) => {
  const { heading, description, buttons, reviews, byline, className } = {
    ...defaultProps,
    ...props,
  };

  const reviewAvatars = (reviews?.avatars ?? []).slice(0, MAX_REVIEW_AVATARS);
  const filledStars = reviews ? Math.round(reviews.rating) : 0;

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
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 w-full sm:w-auto"
                >
                  <a href={buttons.secondary.url}>{buttons.secondary.text}</a>
                </Button>
              )}
            </div>
          </div>

          {reviews && (
            <div className="flex w-full flex-col gap-8 border-border lg:w-auto lg:max-w-sm lg:border-l lg:pl-12">
              <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                <p className="text-6xl leading-none font-bold tracking-tight text-foreground md:text-7xl">
                  {reviews.rating.toFixed(1)}
                </p>
                <div className="flex flex-col items-start gap-1 pb-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "size-4 sm:size-5",
                          index < filledStars
                            ? "fill-amber-400 text-amber-400"
                            : "fill-none stroke-amber-500/70 dark:stroke-amber-400/70",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {reviews.count}+ reviews
                  </p>
                </div>
              </div>
              {reviewAvatars.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="inline-flex shrink-0 items-center -space-x-3">
                    {reviewAvatars.map((avatar, index) => (
                      <Avatar
                        key={index}
                        className="size-12 border-2 border-background after:hidden sm:size-14"
                      >
                        <AvatarImage src={avatar.src} alt={avatar.alt} />
                      </Avatar>
                    ))}
                  </span>
                  {byline && (
                    <p className="max-w-48 text-left text-sm leading-snug text-muted-foreground">
                      {byline}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { Hero296 };
