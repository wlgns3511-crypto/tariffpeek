import type { Metadata } from "next";
import "./globals.css";
import { UpgradeAnalytics } from "@/components/upgrades/UpgradeAnalytics";

const GA_ID = "G-3HEG4CXES8";
const ADSENSE_ID = "ca-pub-5724806562146685";
const SITE_URL = "https://tariffpeek.com";
const ROOT_ALTERNATE_LANGUAGES = {
  en: `${SITE_URL}/`,
  es: `${SITE_URL}/es/`,
  "x-default": `${SITE_URL}/`,
} as const;

export const metadata: Metadata = {
  title: { default: "TariffPeek — HS Code Lookup & Trade Classification", template: "%s | TariffPeek" },
  description: "Search and explore Harmonized System (HS) codes for international trade. Free HS code lookup, tariff classification guide, and trade data.",
  metadataBase: new URL(SITE_URL),
  alternates: { languages: ROOT_ALTERNATE_LANGUAGES },
  openGraph: { type: "website", siteName: "TariffPeek", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  other: { "google-adsense-account": "ca-pub-5724806562146685" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');` }} />
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`} crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": "TariffPeek",
              "url": "https://tariffpeek.com",
              "description": "Search and explore Harmonized System (HS) codes for international trade. Free HS code lookup, tariff classification guide, and trade data.",
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://tariffpeek.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "Organization",
              "name": "TariffPeek",
              "url": "https://tariffpeek.com",
              "description": "Search and explore Harmonized System (HS) codes for international trade. Free HS code lookup, tariff classification guide, and trade data.",
              "parentOrganization": {
                "@type": "Organization",
                "name": "DataPeek Research Network",
                "url": "https://datapeekfacts.com"
              }
            }
          ]
        }) }} />
      </head>
      <body className="bg-white text-slate-900 min-h-screen">
        <UpgradeAnalytics />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:border focus:rounded">Skip to content</a>
        <header className="border-b border-slate-200">
          <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-700">
              📦 TariffPeek
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-slate-600 hover:text-indigo-600">Home</a>
              <a href="/search/" className="text-slate-600 hover:text-indigo-600">Search</a>
              <a href="/about/" className="text-slate-600 hover:text-indigo-600">About</a>
              <a href="/state/" className="text-slate-600 hover:text-indigo-600">By State</a>
              <a href="/guide/" className="text-slate-600 hover:text-indigo-600">Guides</a>
              <a href="/blog/" className="text-slate-600 hover:text-indigo-600">Articles</a>
              <a href="/es/" className="text-slate-600 hover:text-indigo-600 font-semibold">ES</a>
            </div>
          </nav>
        </header>
        <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-slate-500">
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <a href="/about/" className="hover:underline">About</a>
              <a href="/privacy/" className="hover:underline">Privacy</a>
              <a href="/terms/" className="hover:underline">Terms</a>
              <a href="/disclaimer/" className="hover:underline">Disclaimer</a>
              <a href="/contact/" className="hover:underline">Contact</a>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">See Also</p>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
                <a href="https://shipcalcwize.com" className="hover:text-indigo-600" rel="nofollow noopener">Shipping</a>
                <a href="https://calcpeek.com" className="hover:text-indigo-600" rel="nofollow noopener">Calculators</a>
                <a href="https://salarybycity.com" className="hover:text-indigo-600" rel="nofollow noopener">Salaries</a>
              </div>
            </div>
            <p className="mt-3 text-xs italic text-slate-400">Decoding global trade tariffs so importers and exporters don&apos;t have to.</p>
            <p>&copy; {new Date().getFullYear()} TariffPeek. Powered by data from UN Comtrade &amp; WCO. Not legal advice.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
