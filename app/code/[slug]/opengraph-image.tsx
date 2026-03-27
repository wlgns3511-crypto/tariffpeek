import { ImageResponse } from 'next/og';
import { getCodeBySlug, getTopCodes } from '@/lib/db';
import { formatHSCode } from '@/lib/format';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getTopCodes(3000).map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const code = getCodeBySlug(slug);

  if (!code) {
    return new ImageResponse(
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#ea580c', color: 'white', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', fontSize: 48, fontWeight: 800 }}>TARIFFPEEK</div>
      </div>,
      { ...size }
    );
  }

  const formattedCode = formatHSCode(code.hscode);
  const hasRate = code.us_avg_duty !== null;
  const description = code.description.length > 120
    ? code.description.slice(0, 117) + '...'
    : code.description;

  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: '#fff7ed', fontFamily: 'sans-serif', padding: '52px 60px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Left: brand + code + description */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginRight: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', fontSize: 18, fontWeight: 800, color: '#ea580c', letterSpacing: 2 }}>
              TARIFFPEEK
            </div>
            <div style={{ display: 'flex', width: 1, height: 20, backgroundColor: '#fed7aa' }} />
            <div style={{ display: 'flex', fontSize: 18, color: '#9a3412', fontWeight: 600 }}>
              HS Code Lookup
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 52, fontWeight: 800, color: '#1c1917', letterSpacing: -1, marginBottom: 12 }}>
            HS {formattedCode}
          </div>

          <div style={{ display: 'flex', fontSize: 22, color: '#44403c', lineHeight: 1.4, maxWidth: 680 }}>
            {description}
          </div>
        </div>

        {/* Right: tariff rate card */}
        <div style={{ display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: hasRate ? '#ea580c' : '#e7e5e4',
          borderRadius: 20,
          padding: '32px 40px',
          minWidth: 220,
        }}>
          <div style={{ display: 'flex', fontSize: 14, fontWeight: 700, color: hasRate ? '#ffedd5' : '#78716c', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
            US Import Duty
          </div>
          <div style={{ display: 'flex', fontSize: 58, fontWeight: 800, color: hasRate ? '#ffffff' : '#57534e', lineHeight: 1 }}>
            {hasRate ? `${code.us_avg_duty}%` : 'N/A'}
          </div>
          {code.us_duty_range && (
            <div style={{ display: 'flex', fontSize: 14, color: '#ffedd5', marginTop: 10, fontWeight: 500 }}>
              Range: {code.us_duty_range}
            </div>
          )}
          {!hasRate && (
            <div style={{ display: 'flex', fontSize: 13, color: '#78716c', marginTop: 8 }}>
              No rate data
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', width: '100%', height: 2, backgroundColor: '#fed7aa', marginTop: 'auto', marginBottom: 20 }} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontSize: 16, color: '#ea580c', fontWeight: 700 }}>
          tariffpeek.com
        </div>
        <div style={{ display: 'flex', fontSize: 14, color: '#a8a29e' }}>
          US MFN tariff rates · Always verify with USITC
        </div>
      </div>
    </div>,
    { ...size }
  );
}
