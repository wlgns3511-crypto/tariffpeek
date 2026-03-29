import type { Metadata } from "next";
import "./globals.css";

const GA_ID = "G-3HEG4CXES8";
const ADSENSE_ID = "ca-pub-5724806562146685";

export const metadata: Metadata = {
  title: { default: "TariffPeek — HS Code Lookup & Trade Classification", template: "%s | TariffPeek" },
  description: "Search and explore Harmonized System (HS) codes for international trade. Free HS code lookup, tariff classification guide, and trade data.",
  metadataBase: new URL("https://tariffpeek.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
              "inLanguage": "en-US"
            },
            {
              "@type": "Organization",
              "name": "TariffPeek",
              "url": "https://tariffpeek.com",
              "description": "Search and explore Harmonized System (HS) codes for international trade. Free HS code lookup, tariff classification guide, and trade data.",
              "sameAs": []
            }
          ]
        }) }} />
      </head>
      <body className="bg-white text-slate-900 min-h-screen">
        <header className="border-b border-slate-200">
          <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-700">
              📦 TariffPeek
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-slate-600 hover:text-indigo-600">Home</a>
              <a href="/search" className="text-slate-600 hover:text-indigo-600">Search</a>
              <a href="/about" className="text-slate-600 hover:text-indigo-600">About</a>
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-slate-500">
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <a href="/about" className="hover:underline">About</a>
              <a href="/privacy" className="hover:underline">Privacy</a>
              <a href="/terms" className="hover:underline">Terms</a>
              <a href="/contact" className="hover:underline">Contact</a>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Related Resources</p>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
                <a href="https://shipcalcwize.com" className="hover:text-indigo-600">Shipping</a>
                <a href="https://calcpeek.com" className="hover:text-indigo-600">Calculators</a>
                <a href="https://salarybycity.com" className="hover:text-indigo-600">Salaries</a>
              </div>
            </div>
            <p>© {new Date().getFullYear()} TariffPeek. Data from UN Comtrade & WCO. Not legal advice.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
