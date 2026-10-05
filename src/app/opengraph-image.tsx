import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Project LOOP — AI Customer-Feedback Intelligence Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #070a13 0%, #111827 50%, #1e1b4b 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(0,0,0,0) 70%)',
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 18px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#818cf8',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            PROJECT LOOP • ENTERPRISE SAAS
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 18px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            CLAUDE 3.7 SONNET
          </div>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            background: 'linear-gradient(to right, #ffffff, #c7d2fe, #f472b6)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          AI Customer-Feedback Intelligence
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '26px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            marginBottom: '44px',
          }}
        >
          Turns scattered customer feedback into a ranked, evidence-backed list of what to do next. Multi-tenant RBAC, live trend spikes, and grounded vector Q&amp;A.
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            ⚡ Real-Time Spike Alerts
          </div>
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            🛡️ Strict Multi-Tenant Isolation
          </div>
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            📊 1-Click Executive VoC Digests
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
