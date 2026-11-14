import { HomeClient } from "@/components/home-client";
import { getSettings, getTodayMenu } from "@/lib/api";
import type { StoreSettings, TodayMenu } from "@/lib/types";

export async function HomeData() {
  let menu: TodayMenu | null = null;
  let settings: StoreSettings | null = null;

  // The storefront must render even when the API is unreachable or the menu
  // is unpublished — degrade gracefully per DESIGN.md empty states.
  const [menuRes, settingsRes] = await Promise.allSettled([
    getTodayMenu(),
    getSettings(),
  ]);
  if (menuRes.status === "fulfilled") menu = menuRes.value;
  if (settingsRes.status === "fulfilled") settings = settingsRes.value;

  return <HomeClient menu={menu} settings={settings} />;
}
