import Image from "next/image";
import Link from "next/link";
import { areas } from "@/data/areas";
import { logo } from "@/data/images";
import { footerServiceLinks, moreNav, primaryNav } from "@/data/navigation";
import { reviewCountLabel, site } from "@/data/site";
import { TrackedLink } from "./TrackedLink";

export function Footer() {
  const year = new Date().getFullYear();
  const companyLinks = [...primaryNav.filter((n) => n.href !== "/ceramic"), ...moreNav];

  return (
    <footer className="bg-oxblood text-paper">
      <div className="container-ed grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Image
            src={logo.full.file}
            alt="Every Detail"
            width={logo.full.w}
            height={logo.full.h}
            className="h-24 w-auto brightness-0 invert"
          />
          <p className="mt-6 max-w-xs text-paper/80">
            Mobile car detailing in Decatur and nearby Atlanta neighborhoods. {site.tagline}
          </p>
          <p className="mt-3 text-paper/80">
            {site.award.title}
            <br />
            {reviewCountLabel} five-star Google reviews
          </p>
          <TrackedLink href="/book" event="book_click" params={{ location: "footer" }} className="btn btn-on-dark mt-8">
            Book your detail
          </TrackedLink>
        </div>

        <nav aria-label="Services" className="md:col-span-2">
          <h2 className="font-display text-sm font-semibold text-sand">Services</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            {footerServiceLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-paper/85 hover:text-paper hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company" className="md:col-span-2">
          <h2 className="font-display text-sm font-semibold text-sand">Every Detail</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noopener" } : {})}
                  className="text-paper/85 hover:text-paper hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="font-display text-sm font-semibold text-sand">Contact</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            <li>
              <TrackedLink href={site.phone.href} event="phone_click" params={{ location: "footer" }} className="text-paper hover:underline">
                {site.phone.display}
              </TrackedLink>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="text-paper hover:underline">
                {site.email}
              </a>
            </li>
            {site.social.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener" className="text-paper/85 hover:text-paper hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <h2 className="mt-8 font-display text-sm font-semibold text-sand">
            <Link href="/service-areas" className="hover:underline">
              Service areas
            </Link>
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-paper/80">{areas.map((a) => a.name).join(", ")}</p>
        </div>
      </div>
      <div className="border-t border-paper/15">
        <div className="container-ed flex flex-col gap-2 py-6 text-sm text-paper/65 md:flex-row md:justify-between">
          <p>
            © {year} {site.legalName}. Decatur, Georgia.
          </p>
          <p>Student-run. Professionally detailed.</p>
        </div>
      </div>
    </footer>
  );
}
