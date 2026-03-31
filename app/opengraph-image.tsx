import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TariffPeek - US Import Tariffs, HTS Codes and Duty Rates';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#4f46e5', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 16 }}>TariffPeek</div>
        <div style={{ fontSize: 28, opacity: 0.9, textAlign: 'center', maxWidth: '80%' }}>US Import Tariffs, HTS Codes and Duty Rates</div>
      </div>
    ),
    { ...size }
  );
}
