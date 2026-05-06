/**
 * Inline Pricer Panel — embeds the live TQL submission/pricer site
 * (https://submit.tqltpo.com) inside the app via an iframe.
 *
 * Custom API calling was removed in favor of the actual hosted pricer UI,
 * which already has all the form fields, validation, and live OB pricing
 * wired up server-side.
 */

import React, { useState } from 'react';

const PRICER_URL =
  (process.env.VITE_TQL_PRICER_URL as string) || 'https://submit.tqltpo.com';

interface PricerPanelProps {
  onClose: () => void;
}

export default function PricerPanel({ onClose }: PricerPanelProps) {
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          width: '100%',
          maxWidth: 1400,
          height: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 22px',
            borderBottom: '1px solid #e5e5e5',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: '"SF Pro Rounded","Nunito",system-ui,sans-serif',
              fontSize: 17,
              fontWeight: 600,
            }}
          >
            Pricer
          </div>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 9999,
              background: '#fafafa',
              border: '1px solid #e5e5e5',
              fontSize: 11,
              color: '#525252',
              fontFamily: 'ui-monospace,"JetBrains Mono",monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 320,
            }}
          >
            {PRICER_URL.replace(/^https?:\/\//, '')}
          </span>
          <div style={{ flex: 1 }} />
          <a
            href={PRICER_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: '#525252',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 9999,
              border: '1px solid #d4d4d4',
            }}
          >
            Open in new tab ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              border: 0,
              background: 'transparent',
              color: '#737373',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Iframe — full-bleed embed of the live pricer */}
        <div style={{ flex: 1, position: 'relative', background: '#fafafa' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#737373',
                fontSize: 13,
                pointerEvents: 'none',
              }}
            >
              Loading pricer…
            </div>
          )}
          <iframe
            src={PRICER_URL}
            title="TQL Pricer"
            onLoad={() => setLoading(false)}
            style={{
              border: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              background: '#fff',
            }}
            // Allow clipboard, downloads, and same-origin so the embedded app's
            // forms / file pickers / login work normally inside the iframe.
            allow="clipboard-read; clipboard-write; downloads"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
          />
        </div>
      </div>
    </div>
  );
}
