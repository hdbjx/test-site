import { InfoForm } from "@/components/forms/InfoForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Client information | Every Detail",
  description: "Securely send Every Detail the contact information needed to schedule your service.",
  path: "/info-form",
  noindex: true,
});

export default function InfoFormPage() {
  return (
    <section className="bg-paper2">
      <div className="container-ed mx-auto max-w-2xl py-14 md:py-20">
        <p className="eyebrow">Every Detail</p>
        <h1 className="t-h1 mt-3">Your info</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          Send us the basics once so our team can get your detail on the schedule.
        </p>
        <div className="panel mt-8 p-6 md:p-8">
          <InfoForm />
        </div>
      </div>
    </section>
  );
}
