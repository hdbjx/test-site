import { InfoForm } from "@/components/forms/InfoForm";
import { Photo } from "@/components/Photo";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Client information | Every Detail",
  description: "Securely send Every Detail the contact information needed to schedule your service.",
  path: "/info-form",
  noindex: true,
});

export default function InfoFormPage() {
  return (
    <section className="bg-paper2 info-form86">
      <div className="container-ed mx-auto max-w-2xl info-form86-shell">
        <p className="eyebrow">EVERY DETAIL / CLIENT INFO</p>
        <h1>Let’s get you on the schedule.</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          Send us the basics once so our team can get your detail on the schedule.
        </p>
        <div className="info-form86-grid">
          <div className="panel p-6 md:p-8">
            <InfoForm />
          </div>
          <figure className="info-form86-photo">
            <Photo id="hq-crew-shirt-detail" ratio="4/5" sizes="(min-width: 800px) 28vw, 0px" />
            <figcaption>EVERY DETAIL / DECATUR, GA</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
