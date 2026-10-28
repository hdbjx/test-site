import { PageHeader } from "@/components/PageHeader";
import { DetailPlusForm } from "@/components/forms/DetailPlusForm";
import { getDetailPlusCatalog } from "@/lib/detailPlusCatalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Join Detail+ | Every Detail",
  description: "Build your Detail+ plan, pick exactly what gets cleaned, and see your flat per-visit rate for recurring mobile detailing.",
  path: "/detailplus/join",
  noindex: true,
});

export default async function JoinDetailPlus() {
  const catalog = await getDetailPlusCatalog();
  return (
    <div className="service85 service85-join detailplus-join86">
      <PageHeader
        crumbs={[
          { name: "Detail+", path: "/detailplus" },
          { name: "Join", path: "/detailplus/join" },
        ]}
        title="Build your Detail+ plan"
        lede={<p>Pick your vehicle, what gets cleaned, and how often. Your flat rate shows as you build.</p>}
      />
      <section className="container-ed max-w-4xl pb-24" data-header-tone="ink">
        <DetailPlusForm catalog={catalog} />
      </section>
    </div>
  );
}
