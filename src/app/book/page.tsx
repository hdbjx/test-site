import { BookingForm } from "@/components/forms/BookingForm";
import { LiveBooking } from "@/components/forms/LiveBooking";
import { BookingTopBar } from "@/components/forms/BookingTopBar";
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
  const fromHome = from === "home" || from === "context";
  const fromResume = from === "resume";

  // Live booking needs Supabase; without it the site falls back to booking requests.
  if (!supabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="bk-page">
        <div className="bk-shell">
          <BookingTopBar />
          <div className="bk-intro">
            <div>
              <h1 className="bk-intro-title">Book your detail.</h1>
              <p className="bk-intro-sub">We bring the shop to your driveway.</p>
              <p className="bk-intro-facts">Pick your vehicle and service, tell us where the car will be and which days work. We&rsquo;ll confirm the exact time with you.</p>
            </div>
          </div>
          <section id="booking-main" className="container-ed pb-24">
            <BookingForm initialVehicle={initialVehicle} initialService={initialService} />
          </section>
        </div>
      </div>
    );
  }

  const session = await getSession().catch(() => ({ state: "signed-out" as const }));
  const customer = session.state === "customer" ? session : null;

  return (
    <div className="bk-page">
      <LiveBooking
        account={customer?.account}
        email={customer?.email}
        garage={customer?.garage}
        initialVehicle={initialVehicle}
        initialService={initialService}
        initialAddons={initialAddons}
        initialPaint={initialPaint}
        fromQuote={fromQuote}
        fromHome={fromHome}
        fromResume={fromResume}
      />
    </div>
  );
}
