import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrderPage from "@/app/(home)/orders/page";
// Import the original specifiers (not the __mocks__ paths) so the story and
// the page share one module instance — the mock redirect rewrites both.
import { __setOrders } from "@/lib/api";
import { __setMyOrders } from "@/lib/account";
import { __setSignedIn } from "@clerk/nextjs";
import {
  cancelledOrder,
  completedDeliveryOrder,
  confirmedOrder,
  placedOrderBeforeCutoff,
  readyForPickupOrder,
} from "../fixtures/orders";

const meta: Meta<typeof OrderPage> = {
  title: "Pages/Orders",
  component: OrderPage,
};

export default meta;
type Story = StoryObj<typeof OrderPage>;

/** Guest memory lives in localStorage (order-store); seed it for guests. */
function seedStoredOrders(orders: { manage_token: string }[]) {
  localStorage.setItem(
    "tiffin_orders_v1",
    JSON.stringify(
      orders.map((o) => ({ token: o.manage_token, placedAt: new Date().toISOString() })),
    ),
  );
}

/** Configure mock data + query client per story. */
function harness(setup: () => void): Story["render"] {
  return () => {
    setup();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    return (
      <QueryClientProvider client={client}>
        <OrderPage />
      </QueryClientProvider>
    );
  };
}

export const GuestSingleOrder: Story = {
  // Just-placed flow: lands with ?token=…&placed=1
  parameters: {
    nextjs: { appDirectory: true, navigation: { query: { token: "tok_fixture", placed: "1" } } },
  },
  render: harness(() => {
    __setSignedIn(false);
    seedStoredOrders([placedOrderBeforeCutoff]);
    __setOrders([placedOrderBeforeCutoff]);
  }),
};

export const GuestMultipleOrders: Story = {
  parameters: { nextjs: { appDirectory: true, navigation: { query: {} } } },
  render: harness(() => {
    __setSignedIn(false);
    const orders = [
      { ...readyForPickupOrder, manage_token: "tok_b" },
      placedOrderBeforeCutoff,
      { ...cancelledOrder, manage_token: "tok_c" },
    ];
    seedStoredOrders(orders);
    __setOrders(orders);
  }),
};

export const GuestNoOrders: Story = {
  parameters: { nextjs: { appDirectory: true, navigation: { query: {} } } },
  render: harness(() => {
    __setSignedIn(false);
    localStorage.removeItem("tiffin_orders_v1");
    __setOrders([]);
  }),
};

export const SignedInHistory: Story = {
  parameters: { nextjs: { appDirectory: true, navigation: { query: {} } } },
  render: harness(() => {
    __setSignedIn(true);
    localStorage.removeItem("tiffin_orders_v1");
    __setMyOrders([
      { ...confirmedOrder, manage_token: "tok_m1" },
      { ...completedDeliveryOrder, manage_token: "tok_m2" },
    ]);
  }),
};
