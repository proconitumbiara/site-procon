"use client";

import { useEffect, useRef } from "react";

import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
  hasMarketingConsent,
} from "@/lib/cookieConsent";

function appendScript(id: string, src: string): void {
  if (document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function appendInlineScript(id: string, content: string): void {
  if (document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.textContent = content;
  document.head.appendChild(script);
}

function loadGoogleAnalytics(gaId: string): void {
  appendScript("ga-loader", `https://www.googletagmanager.com/gtag/js?id=${gaId}`);
  appendInlineScript(
    "ga-inline",
    `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `,
  );
}

function loadGoogleTagManager(gtmId: string): void {
  appendInlineScript(
    "gtm-inline",
    `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `,
  );
}

function loadMetaPixel(pixelId: string): void {
  appendInlineScript(
    "meta-pixel-inline",
    `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `,
  );
}

export default function Analytics() {
  const loaded = useRef({
    ga: false,
    gtm: false,
    meta: false,
  });

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
    const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

    const runProviders = () => {
      if (hasAnalyticsConsent()) {
        if (gaId && !loaded.current.ga) {
          loadGoogleAnalytics(gaId);
          loaded.current.ga = true;
        }

        if (gtmId && !loaded.current.gtm) {
          loadGoogleTagManager(gtmId);
          loaded.current.gtm = true;
        }
      }

      if (hasMarketingConsent() && metaPixelId && !loaded.current.meta) {
        loadMetaPixel(metaPixelId);
        loaded.current.meta = true;
      }
    };

    runProviders();
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, runProviders);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, runProviders);
    };
  }, []);

  return null;
}

