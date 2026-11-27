import { PRICING, services } from "@/data/services";

/** Quick-pick gift card amounts. Team HQ → Settings can change these. */
export const GIFT_CARD_PRESETS: number[] = [100, 150, 250, 400];

/** Gift card "packages": each one is just a dollar amount (the sedan price of that detail),
 *  sent to the backend exactly like a preset. Read at render so live pricing applies. */
export function giftCardPackages(): { label: string; amount: number }[] {
  const s = PRICING.sedan;
  return [
    { label: services.maintenance.name, amount: s.maintenance.price },
    { label: services.premium.name, amount: s.premium.price },
    { label: services.factoryReset.name, amount: s.factoryReset.price },
  ];
}
