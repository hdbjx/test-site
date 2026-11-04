import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GoogleReviewStatsProvider } from "@/components/GoogleReviewStats";
import { JsonLd } from "@/components/JsonLd";
import { VehicleProvider } from "@/components/vehicle/VehicleContext";
import { VehicleGlobalUI } from "@/components/vehicle/VehicleGlobalUI";
import { JourneyProvider } from "@/components/journey/JourneyContext";
import { JourneyGlobalUI } from "@/components/journey/JourneyGlobalUI";
import { site } from "@/data/site";
import { localBusinessSchema } from "@/lib/seo";
import { CatalogSync } from "@/components/CatalogSync";
import { ensureLiveCatalog } from "@/lib/live-catalog-server";
import { AnnouncementBar } from "@/components/announcement/AnnouncementBar";

// Prices come from the live catalog (Team HQ); pages refresh at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Mobile Car Detailing in Decatur, GA | Every Detail", template: "%s | Every Detail" },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
  icons: { icon: "/brand/every-detail-logo.png", apple: "/brand/every-detail-logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#f3f1ec",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = await ensureLiveCatalog();
  // Hide the notice after its end date (Eastern time).
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
  const notice = site.announcement && (!site.announcement.endsOn || site.announcement.endsOn >= today) ? site.announcement : null;
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <CatalogSync data={catalog} />
        <a href="#main" className="site-skip-link">Skip to content</a>
        <GoogleReviewStatsProvider>
        <VehicleProvider>
        <JourneyProvider>
        <VehicleGlobalUI />
        <JourneyGlobalUI />
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        {notice ? <AnnouncementBar text={notice.text} linkText={notice.linkText} linkUrl={notice.linkUrl} /> : null}
        <JsonLd data={localBusinessSchema()} />
        <Analytics />
        </JourneyProvider>
        </VehicleProvider>
        </GoogleReviewStatsProvider>
      </body>
    </html>
  );
}
