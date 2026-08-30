import Script from "next/script";

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}</Script>
    </>
  );
}
