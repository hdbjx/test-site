import { PageHeader } from "@/components/PageHeader";
import { DetailPlusForm } from "@/components/forms/DetailPlusForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Join Detail+ | Every Detail",
  description: "Build your Detail+ plan and get a flat per-visit rate for recurring mobile detailing.",
  path: "/detailplus/join",
  noindex: true,
});

export default function JoinDetailPlus() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Detail+", path: "/detailplus" },
          { name: "Join", path: "/detailplus/join" },
        ]}
        title="Build your Detail+ plan"
        lede={<p>Choose your schedule, coverage and vehicle. We&rsquo;ll send your flat rate.</p>}
      />
      <section className="container-ed max-w-4xl pb-24">
        <DetailPlusForm />
      </section>
    </>
  );
}
