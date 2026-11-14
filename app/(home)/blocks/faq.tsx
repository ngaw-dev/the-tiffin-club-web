export function Faq({ windowLabel }: { windowLabel: string | null }) {
  return (
    <section id="faq" className="scroll-mt-24 pb-16">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">Common questions</h2>
      <div className="mt-6 divide-y divide-border border border-border bg-card">
        {[
          ...(windowLabel
            ? [
                {
                  q: "What time can I order?",
                  a: `Ordering runs ${windowLabel}, every day. After ${windowLabel.split("-")[1]} the kitchen locks in the prep list.`,
                },
              ]
            : []),
          {
            q: "Can I change or cancel my order?",
            a: `Yes. You can update any detail or cancel${windowLabel ? ` until the ${windowLabel.split("-")[1]} cutoff` : ""} from your manage-order link. After that, give us a call.`,
          },
          {
            q: "How do I pay?",
            a: "In person, at pickup or delivery. No online payment. What you see on your order total is what you pay.",
          },
          {
            q: "Where do you deliver?",
            a: "We deliver to selected suburbs — the list is in checkout. We time the delivery run, so there's no need to pick a slot.",
          },
        ].map((item) => (
          <details key={item.q} className="group px-6 py-4">
            <summary className="list-none font-medium marker:hidden">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span aria-hidden className="text-muted-foreground transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
