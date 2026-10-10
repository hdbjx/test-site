import { PageHeader } from "@/components/PageHeader";
import { UpdatePasswordForm } from "@/components/account/UpdatePasswordForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Set a new password | Every Detail", description: "Set a new password.", path: "/account/update-password", noindex: true });

export default function UpdatePasswordPage() {
  return (
    <>
      <PageHeader crumbs={[{ name: "Account", path: "/account" }, { name: "New password", path: "/account/update-password" }]} title="Set a new password" />
      <section className="container-ed max-w-xl pb-24">
        <UpdatePasswordForm />
      </section>
    </>
  );
}
