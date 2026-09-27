import { PageHeader } from "@/components/PageHeader";
import { BookingForm } from "@/components/forms/BookingForm";
import { isServiceId, isVehicleId } from "@/data/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book Mobile Car Detailing | Every Detail, Decatur GA",
  description:
    "Choose your vehicle and service, see your price, and pick the days that work. We come to you in Decatur and nearby Atlanta.",
  path: "/book",
});

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string; service?: string }>;
}) {
  const { vehicle, service } = await searchParams;
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Book", path: "/book" }]}
        title="Book your detail"
        lede={<p>Pick your vehicle and service, tell us where the car will be and which days work. We&rsquo;ll confirm the exact time with you.</p>}
      />
      <section className="container-ed pb-24">
        <BookingForm
          initialVehicle={isVehicleId(vehicle) ? vehicle : undefined}
          initialService={isServiceId(service) ? service : undefined}
        />
      </section>
    </>
  );
}
