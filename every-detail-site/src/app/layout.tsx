import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { MobileBookBar } from "@/components/MobileBookBar";
import { site } from "@/data/site";
import { localBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Mobile Car Detailing in Decatur, GA | Every Detail", template: "%s | Every Detail" },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
  icons: { icon: "/brand/every-detail-mark.png", apple: "/brand/every-detail-mark.png" },
};

export const viewport: Viewport = {
  themeColor: "#f3f1ec",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <MobileBookBar />
        <JsonLd data={localBusinessSchema()} />
        <Analytics />
      </body>
    </html>
  );
}
