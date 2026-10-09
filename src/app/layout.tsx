import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { store } from "@/config/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/Toaster";
import { StoreHydrator } from "@/components/StoreHydrator";
import { env } from "@/lib/env";
import { saleProducts } from "@/lib/deals";
import { parsePromos } from "@/lib/promo";
import { CompareBar } from "@/components/CompareBar";
import { getAllProducts, getDepartments } from "@/modules/products/services/productService";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { ErrorProvider } from "@/components/providers/ErrorProvider";

const bodyFont = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: store.name, template: `%s · ${store.name}` },
  description: store.hero.lead,
  openGraph: { siteName: store.name, type: "website", locale: store.locale.replace("-", "_") },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { themeColor: "#14213D", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const departments = await getDepartments();
  const today = new Date().toISOString().slice(0, 10);
  const hasDeals = await getAllProducts()
    .then((all) => saleProducts(all).length > 0)
    .catch(() => false) || parsePromos(env.promoCodes).some((p) => p.public && (!p.expires || p.expires >= today));
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <AnalyticsProvider>
          <ErrorProvider>
            <StoreHydrator />
            <Header departments={departments} hasDeals={hasDeals} />
            {children}
            <Footer departments={departments} />
            <CartDrawer />
            <CompareBar />
            <Toaster />
          </ErrorProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
