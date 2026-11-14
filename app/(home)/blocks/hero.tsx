const HERO_IMG =
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=70";

export function Hero({ windowLabel }: { windowLabel: string | null }) {
  return (
    <section className="grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <div>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Today&apos;s meal, ordered simply.
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
          One kitchen, one honest home-style tiffin a day.
          {windowLabel ? ` Order by ${windowLabel.split("-")[1]},` : ""} pick up or get it delivered
          in Wellington.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            href="#todays-menu"
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            Order today&apos;s meal
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            How it works
          </a>
        </div>
      </div>
      <div className="group overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMG}
          alt="A home-style Indian meal served in steel tiffin containers"
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    </section>
  );
}
