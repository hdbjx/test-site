import { PRICING, services, type VehicleId } from "@/data/services";

/** Quick-pick gift card amounts. Team HQ → Settings can change these. */
export const GIFT_CARD_PRESETS: number[] = [100, 150, 250, 400];

/** Gift card "packages": a detail priced for the recipient's vehicle. Each is just a dollar amount,
 *  sent to the backend exactly like a typed amount. Read at render so live pricing applies. */
export const GIFT_PACKAGE_SERVICES = ["maintenance", "premium", "factoryReset"] as const;
export type GiftPackageService = (typeof GIFT_PACKAGE_SERVICES)[number];
export function giftCardPackages(vehicle: VehicleId = "sedan"): { service: GiftPackageService; label: string; amount: number }[] {
  return GIFT_PACKAGE_SERVICES.map((service) => ({ service, label: services[service].name, amount: PRICING[vehicle][service].price }));
}
