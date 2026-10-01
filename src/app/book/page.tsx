import { PageHeader } from "@/components/PageHeader";
import { BookingForm } from "@/components/forms/BookingForm";
import { LiveBooking } from "@/components/forms/LiveBooking";
import { isServiceId, isVehicleId } from "@/data/services";
import { isAddonId, isPaintUpgradeId, type AddonId, type PaintUpgradeId } from "@/data/quoteExtras";
import { getSession } from "@/lib/supabase/account";
import { supabaseConfigured } from "@/lib/supabase/config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book Mobile Car Detailing | Every Detail, Decatur GA",
  description:
    "Choose your vehicle and service, see your price, and book an open time. We come to you in Decatur and nearby Atlanta.",
  path: "/book",
});

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string; service?: string; addons?: string; paint?: string; from?: string }>;
}) {
  const { vehicle, service, addons, paint, from } = await searchParams;
  const initialVehicle = isVehicleId(vehicle) ? vehicle : undefined;
  const initialService = isServiceId(service) ? service : undefined;
  const initialAddons = (addons ?? "").split(",").filter(isAddonId) as AddonId[];
  const initialPaint = (paint ?? "").split(",").filter(isPaintUpgradeId) as PaintUpgradeId[];
  const fromQuote = from === "quote";

  // Live booking needs Supabase; without it the site falls back to booking requests.
  if (!supabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <>
        <PageHeader
          crumbs={[{ name: "Book", path: "/book" }]}
          title="Book your detail"
          lede={<p>Pick your vehicle and service, tell us where the car will be and which days work. We&rsquo;ll confirm the exact time with you.</p>}
        />
        <section className="container-ed pb-24">
          <BookingForm initialVehicle={initialVehicle} initialService={initialService} />
        </section>
      </>
    );
  }

  const session = await getSession().catch(() => ({ state: "signed-out" as const }));
  const customer = session.state === "customer" ? session : null;

  return (
    <>
      <PageHeader
        crumbs={[{ name: "Book", path: "/book" }]}
        title="Book your detail"
        lede={<p>Pick one or two vehicles, choose a service for each, and grab an open time. It&rsquo;s booked when you hit the button.</p>}
      />
      <section className="container-ed pb-24">
        <LiveBooking
          account={customer?.account}
          email={customer?.email}
          garage={customer?.garage}
          initialVehicle={initialVehicle}
          initialService={initialService}
          initialAddons={initialAddons}
          initialPaint={initialPaint}
          fromQuote={fromQuote}
        />
      </section>
    </>
  );
}
