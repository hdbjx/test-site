import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/** GA4 + Vercel Web Analytics. GA4 renders nothing unless NEXT_PUBLIC_GA_ID is set. */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <>
      {id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`}
          </Script>
        </>
      )}
      <VercelAnalytics />
    </>
  );
}
