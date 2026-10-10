import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { SignInForm } from "@/components/account/SignInForm";
import { getSession } from "@/lib/supabase/account";
import { supabaseConfigured } from "@/lib/supabase/config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Sign in | Every Detail", description: "Sign in to manage your vehicles and bookings.", path: "/account/sign-in", noindex: true });

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ mode?: string; next?: string; error?: string }> }) {
  if (!supabaseConfigured) redirect("/book");
  const { mode, next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const session = await getSession().catch(() => ({ state: "signed-out" as const }));
  if (session.state === "customer") redirect(safeNext);

  return (
    <>
      <PageHeader
        crumbs={[{ name: "Account", path: "/account" }, { name: "Sign in", path: "/account/sign-in" }]}
        title={mode === "signup" ? "Create your account" : "Sign in"}
        lede={<p>Save your vehicles and address, see your upcoming details, and book in a few taps.</p>}
      />
      <section className="container-ed max-w-xl pb-24">
        <SignInForm initialMode={mode === "signup" ? "signup" : "signin"} next={safeNext} linkError={error === "link"} />
      </section>
    </>
  );
}
