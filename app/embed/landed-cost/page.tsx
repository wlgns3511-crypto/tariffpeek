import { Metadata } from "next";
import { LandedCostCalculator } from "@/components/LandedCostCalculator";

export const metadata: Metadata = {
  title: "Landed Cost Calculator - Embeddable Widget",
  robots: "noindex, nofollow",
};

export default function EmbedLandedCostPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <LandedCostCalculator defaultTariffRate={10} hsCode="" />
      <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>
        Powered by{" "}
        <a href="https://tariffpeek.com" target="_blank" rel="noopener" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          TariffPeek
        </a>
      </p>
    </div>
  );
}
