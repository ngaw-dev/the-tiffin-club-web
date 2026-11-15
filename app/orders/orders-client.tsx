"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { getMyAccount, getMyOrders } from "@/lib/account";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const money = (cents: number) =>
  new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(cents / 100);

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            {new Date(order.placed_at).toLocaleDateString("en-NZ", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </CardTitle>
          <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
            {STATUS_LABELS[order.status] ?? order.status}
          </Badge>
        </div>
        <CardDescription className="capitalize">{order.fulfilment}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1 text-sm">
          {order.items.map((item) => (
            <li key={item.name} className="flex justify-between">
              <span>
                {item.quantity}× {item.name}
              </span>
              <span className="text-muted-foreground">
                {money(item.unit_price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{money(order.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrdersClient() {
  const { isSignedIn, getToken } = useAuth();
  const { data, isPending, isError } = useQuery({
    queryKey: ["account", "orders"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      const [orders, account] = await Promise.all([getMyOrders(token), getMyAccount(token)]);
      return { orders, account };
    },
    enabled: isSignedIn === true,
  });

  if (isPending) {
    return <p className="text-muted-foreground">Loading your orders…</p>;
  }

  if (isError) {
    return (
      <p className="text-muted-foreground">
        We couldn&apos;t load your orders right now. Please try again in a moment.
      </p>
    );
  }

  const { orders, account } = data;
  if (!account) return null;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">{account.email ?? account.name}</span>
      </p>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet — today&apos;s menu is waiting.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((order: Order) => (
            <OrderCard key={order.manage_token} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
