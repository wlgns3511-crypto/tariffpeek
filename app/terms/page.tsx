import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for TariffPeek.",
  alternates: { canonical: "/terms/" },
  openGraph: { url: "/terms/" },
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 26, 2026</p>

      <p>
        Welcome to TariffPeek. By accessing or using our website at tariffpeek.com, you agree to be bound by these
        Terms of Service. If you do not agree to these terms, please do not use our website.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Use of the Website</h2>
      <p>
        TariffPeek provides HS code lookup, tariff classification information, and trade data for informational and
        educational purposes only. You may use the website for personal and commercial research purposes. The
        information provided should not be the sole basis for customs declarations or trade compliance decisions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Not Legal or Customs Advice</h2>
      <p>
        The information on TariffPeek is provided for general informational purposes only and does not constitute
        legal, customs, or professional trade advice. HS code classifications may vary by country, and tariff rates
        are subject to change. You should consult with a licensed customs broker, trade attorney, or the relevant
        customs authority in your country before making import/export decisions based on information found on this
        website. We are not responsible for any errors in customs declarations or any penalties, duties, or losses
        arising from the use of this information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Accuracy of Information</h2>
      <p>
        While we strive to provide accurate and up-to-date information, we make no warranties or representations
        regarding the completeness, accuracy, or reliability of any content on this website. The data presented is
        sourced from publicly available datasets, including the World Customs Organization and UN Comtrade. Users
        should independently verify any information before making decisions based on it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Intellectual Property</h2>
      <p>
        The content, design, and layout of this website are the property of TariffPeek and are protected by copyright
        and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any
        content on this website without our prior written consent.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Third-Party Links and Advertising</h2>
      <p>
        Our website may contain links to third-party websites and display advertisements served by third-party ad
        networks, including Google AdSense. We are not responsible for the content, privacy practices, or terms of
        any third-party websites. Your interactions with third-party advertisers are solely between you and the
        advertiser.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, TariffPeek shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages arising out of or related to your use of the website. This includes, but
        is not limited to, damages for loss of profits, data, or other intangible losses, as well as any customs
        penalties, duties, or fines resulting from incorrect tariff classification.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Changes to These Terms</h2>
      <p>
        We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon
        posting on this page. Your continued use of the website after changes are posted constitutes your acceptance
        of the revised terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        If you have any questions about these Terms of Service, please visit our{" "}
        <a href="/contact" className="text-indigo-600 hover:underline">Contact page</a>.
      </p>
    </article>
  );
}
