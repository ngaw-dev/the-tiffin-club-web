import { HomeClient } from "@/app/(home)/home-client";
import { CartProvider } from "@/lib/cart-context";

export default function Page() {
  return (
    <CartProvider>
      <HomeClient />
    </CartProvider>
  );
}
