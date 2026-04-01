import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TariffPeek",
  description: "Learn about TariffPeek, our mission, and data sources for HS code lookup and trade classification.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">About TariffPeek</h1>

      <p>
        TariffPeek is a free tool for looking up Harmonized System (HS) codes used in international trade.
        Whether you are an importer, exporter, customs broker, or trade researcher, TariffPeek makes it easy
        to search and explore the global HS classification system.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        Correctly classifying goods is essential for determining tariff rates, complying with trade regulations,
        and avoiding costly customs delays. Our goal is to make HS code lookup fast, intuitive, and accessible
        to everyone &mdash; from first-time importers to experienced trade professionals.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        The HS code data on TariffPeek is based on the Harmonized Commodity Description and Coding System
        maintained by the <strong>World Customs Organization (WCO)</strong>. Trade statistics and supplementary
        data are sourced from <strong>UN Comtrade</strong>, the United Nations international trade statistics
        database. We update our data as new revisions become available.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">How It Works</h2>
      <p>
        You can search by product name, keyword, or HS code number. Results are organized hierarchically:
        sections, chapters (2-digit), headings (4-digit), and subheadings (6-digit). The first six digits of
        an HS code are standardized worldwide, while individual countries may add additional digits for their
        national tariff schedules.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        Have questions or feedback? Visit our{" "}
        <a href="/contact" className="text-indigo-600 hover:underline">Contact page</a> to get in touch.
      </p>
    </article>
  );
}
