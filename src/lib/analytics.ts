type AnalyticsParameters = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, parameters?: AnalyticsParameters) => void;
  }
}

export function trackStorefrontEvent(name: string, parameters?: AnalyticsParameters) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, parameters);
}
