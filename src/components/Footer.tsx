import Image from "next/image";
import Link from "next/link";
import { areas } from "@/data/areas";
import { footerServiceLinks, moreNav, primaryNav } from "@/data/navigation";
import { site } from "@/data/site";
import { GoogleMapsAttribution, LiveReviewCount } from "./GoogleReviewStats";
import { TrackedLink } from "./TrackedLink";

export function Footer() {
  const year = new Date().getFullYear();
  const companyLinks = [...primaryNav.filter((n) => n.href !== "/ceramic"), ...moreNav];
  return (
    <footer className="site-footer" data-header-tone="light">
      <div className="container-ed site-footer-grid">
        <div className="site-footer-brand">
          <Image src="/brand/every-detail-logo.png" alt="Every Detail" width={1000} height={1000} />
          <h2>YOUR CAR.<br/><span>BACK TO ITS BEST.</span></h2>
          <p>Mobile car detailing in Decatur and nearby Atlanta neighborhoods.</p>
          <TrackedLink href="/book" event="book_click" params={{ location: "footer" }} className="site-footer-book">Book a detail ↗</TrackedLink>
        </div>
        <nav aria-label="Services" className="site-footer-column"><h3>Services</h3>{footerServiceLinks.map(l=><Link key={l.href} href={l.href}>{l.label}</Link>)}</nav>
        <nav aria-label="Company" className="site-footer-column"><h3>Every Detail</h3>{companyLinks.map(l=><Link key={l.href} href={l.href} {...(l.external?{target:"_blank",rel:"noopener"}:{})}>{l.label}</Link>)}</nav>
        <div className="site-footer-column site-footer-contact"><h3>Contact</h3><TrackedLink href={site.phone.href} event="phone_click" params={{location:"footer"}}>{site.phone.display}</TrackedLink><a href={`mailto:${site.email}`}>{site.email}</a>{site.social.map(s=><a key={s.href} href={s.href} target="_blank" rel="noopener">{s.label}</a>)}<p><LiveReviewCount /> five-star reviews · <GoogleMapsAttribution className="google-maps-attribution-on-dark" /></p></div>
      </div>
      <div className="container-ed site-footer-bottom"><span>© {year} {site.legalName}. Decatur, Georgia.</span><span>{areas.map(a=>a.name).slice(0,5).join(" / ")}</span><span><Link href="/terms">Terms</Link> / <Link href="/privacy-policy">Privacy</Link></span></div>
    </footer>
  );
}
