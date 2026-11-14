import { HomeClient } from "@/components/home/home-client";
import { CartProvider } from "@/lib/cart-context";

export default function Home() {
  return (
    <CartProvider>
      <HomeClient />
    </CartProvider>
  );
}
