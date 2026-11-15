import type { Metadata } from "next";
import { OrdersClient } from "./orders-client";

export const metadata: Metadata = {
  title: "My orders | The Tiffin Club",
};

export default function OrdersPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold">My orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every order tied to your account, newest first — guest history included.
      </p>
      <div className="mt-8">
        <OrdersClient />
      </div>
    </section>
  );
}
