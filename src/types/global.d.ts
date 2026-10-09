export {};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (
      command: "config" | "event",
      target: string,
      params?: Record<string, unknown>
    ) => void;
    mixpanel?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}
