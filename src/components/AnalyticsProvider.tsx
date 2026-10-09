"use client";

import { withMixpanel } from "@/lib/analytics";
import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const pageLocation =
      typeof window !== "undefined"
        ? query
          ? `${window.location.origin}${pathname}?${query}`
          : `${window.location.origin}${pathname}`
        : pathname;

    if (window.gtag && GA4_ID) {
      window.gtag("event", "page_view", {
        page_title: document.title,
        page_location: pageLocation
      });
    }

    if (MIXPANEL_TOKEN) {
      withMixpanel((m) => m.track("page_view", { page_path: pathname, page_location: pageLocation }));
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {GA4_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){window.dataLayer.push(arguments);}
              window.gtag('js', new Date());
              window.gtag('config', '${GA4_ID}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
