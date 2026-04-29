import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Methodology — How TariffPeek Builds Its HS Code Data",
  description:
    "How TariffPeek sources tariff classification and import duty data — anchored in the WCO Harmonized System, US International Trade Commission HTS, CBP CROSS rulings, and USTR free trade agreement texts.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        Tariff classification drives a real money outcome on every
        international shipment. You deserve to know exactly where our
        HS code data comes from, and what only an official binding
        ruling can tell you about a specific product.
      </p>

      <div className="not-prose border-l-4 border-amber-400 bg-amber-50 p-4 my-4 rounded-r">
        <p className="text-sm text-amber-900">
          <strong>Important disclosure.</strong> TariffPeek is an
          informational reference. For any actual import decision,
          you must verify the 10-digit HTS code on the official{" "}
          <a
            href="https://hts.usitc.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            USITC Harmonized Tariff Schedule
          </a>{" "}
          and request a binding ruling from CBP via{" "}
          <a
            href="https://rulings.cbp.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            CROSS
          </a>{" "}
          for any borderline classification.
        </p>
      </div>

      <h2>Primary source: WCO Harmonized System</h2>
      <p>
        Every HS code on TariffPeek is anchored in the{" "}
        <a
          href="https://www.wcoomd.org/en/topics/nomenclature/overview.aspx"
          target="_blank"
          rel="noopener noreferrer"
        >
          World Customs Organization (WCO) Harmonized System
        </a>
        . The HS is a 6-digit nomenclature used by 200+ countries.
        The current edition is HS 2022. The United States extends to
        10 digits as the{" "}
        <a
          href="https://hts.usitc.gov/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Harmonized Tariff Schedule (HTS)
        </a>
        , maintained by the US International Trade Commission. The
        HTS is the legal US tariff schedule.
      </p>

      <h2>What we publish per HS code</h2>
      <ul>
        <li>
          <strong>HS code (6-digit international)</strong>
        </li>
        <li>
          <strong>HTS code (10-digit US extension)</strong> where
          applicable.
        </li>
        <li>
          <strong>Description</strong> &mdash; the official WCO/HTS
          description.
        </li>
        <li>
          <strong>Section and chapter</strong>
        </li>
        <li>
          <strong>US average duty rate</strong> &mdash; the
          most-favored-nation (MFN) duty rate for the 10-digit HTS,
          before any trade preferences or special tariffs.
        </li>
        <li>
          <strong>FTA notes</strong> &mdash; whether US FTAs provide
          preferential rates for qualifying origins.
        </li>
      </ul>

      <h2>Cross-reference and verification</h2>
      <ul>
        <li>
          <a
            href="https://www.wcoomd.org/en/topics/nomenclature/overview.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            WCO Harmonized System
          </a>{" "}
          &mdash; the international primary source.
        </li>
        <li>
          <a
            href="https://hts.usitc.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            USITC HTS Search
          </a>{" "}
          &mdash; the official US legal tariff schedule.
        </li>
        <li>
          <a
            href="https://rulings.cbp.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CBP CROSS Rulings
          </a>{" "}
          &mdash; CBP&apos;s database of binding classification
          rulings.
        </li>
        <li>
          <a
            href="https://ustr.gov/trade-agreements/free-trade-agreements"
            target="_blank"
            rel="noopener noreferrer"
          >
            USTR Free Trade Agreements
          </a>{" "}
          &mdash; official FTA texts and qualification rules.
        </li>
        <li>
          <a
            href="https://usatrade.census.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Census USA Trade Online
          </a>{" "}
          &mdash; US import/export trade statistics by HS code.
        </li>
      </ul>

      <h2>Update frequency</h2>
      <p>
        WCO HS updates every 5 years. The US HTS updates annually
        plus periodic revisions for trade actions. CBP CROSS rulings
        update continuously. We refresh our combined dataset monthly.
      </p>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>10-digit HTS only is legal.</strong> The duty rate
          that actually applies to your shipment is the 10-digit
          HTS, not the 6-digit international HS.
        </li>
        <li>
          <strong>No real-time Section 301 tracking.</strong> US
          tariffs against China and other countries change with
          policy. Always check the current USTR Section 301 lists.
        </li>
        <li>
          <strong>No antidumping/countervailing duties.</strong>
          AD/CVD orders are product- and origin-specific and apply
          on top of MFN duties. Check the ITA AD/CVD database.
        </li>
        <li>
          <strong>Borderline classifications.</strong> For products
          where multiple HS codes could apply, request a binding
          CROSS ruling.
        </li>
        <li>
          <strong>Not customs or legal advice.</strong> For shipments
          with real money on the line, work with a licensed customs
          broker.
        </li>
      </ul>

      <h2>Corrections and feedback</h2>
      <p>
        If a published WCO or USITC figure disagrees with what you
        see here, please <a href="/contact">contact us</a> with the
        HS code and the source URL.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed in April 2026. Material
        changes to how we source or compute the data will be reflected
        here before they reach production pages.
      </p>
    </article>
  );
}
