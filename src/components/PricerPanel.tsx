/**
 * Inline Pricer Panel — opens as an in-app overlay (not a redirect).
 * 4 sections (Borrower, Property, Loan, Rate Lock) → POST /api/pricer/quote
 * → render results inline. If OB returns an error, surfaces a deep-link to
 * https://submit.tqltpo.com so the LO can fall back to the full pricer.
 */

import React, { useState } from 'react';

const PRICER_FALLBACK_URL =
  (process.env.VITE_TQL_PRICER_URL as string) || 'https://submit.tqltpo.com';

interface PricerPanelProps {
  onClose: () => void;
}

interface Scenario {
  fico: number;
  selfEmployed: boolean;
  foreignNational: boolean;
  propertyAddress: string;
  propertyState: string;
  propertyType: string;
  occupancy: string;
  units: number;
  loanAmount: number;
  ltv: number;
  loanPurpose: 'Purchase' | 'RateTerm' | 'CashOut';
  docType: string;
  lockPeriod: number;
  buydown: string;
}

const DEFAULT_SCENARIO: Scenario = {
  fico: 720,
  selfEmployed: false,
  foreignNational: false,
  propertyAddress: '',
  propertyState: '',
  propertyType: 'SingleFamily',
  occupancy: 'Investment',
  units: 1,
  loanAmount: 425000,
  ltv: 75,
  loanPurpose: 'Purchase',
  docType: 'DSCR',
  lockPeriod: 30,
  buydown: 'None',
};

interface QuoteResult {
  ok: boolean;
  data?: unknown;
  error?: string;
  fallbackUrl?: string;
  scenario?: Scenario;
}

const FIELD_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#737373',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
  display: 'block',
};

const FIELD_INPUT: React.CSSProperties = {
  width: '100%',
  height: 36,
  padding: '0 12px',
  borderRadius: 9,
  border: '1px solid #d4d4d4',
  outline: 'none',
  fontSize: 13.5,
  background: '#fff',
  fontFamily: 'inherit',
};

const SECTION_CARD: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: 14,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const SECTION_TITLE: React.CSSProperties = {
  fontFamily: '"SF Pro Rounded","Nunito",system-ui,sans-serif',
  fontSize: 14,
  fontWeight: 600,
  color: '#000',
  marginBottom: 6,
};

export default function PricerPanel({ onClose }: PricerPanelProps) {
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const [busy, setBusy] = useState<boolean>(false);
  const [result, setResult] = useState<QuoteResult | null>(null);

  const update = <K extends keyof Scenario>(key: K, value: Scenario[K]): void => {
    setScenario((s) => ({ ...s, [key]: value }));
  };

  const submit = async (): Promise<void> => {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/pricer/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario),
      });
      const json = (await res.json()) as QuoteResult;
      setResult(json);
    } catch (err: unknown) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : 'Network error',
        fallbackUrl: PRICER_FALLBACK_URL,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#fafafa',
          borderRadius: 18,
          width: '100%',
          maxWidth: 920,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e5e5e5',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: '"SF Pro Rounded","Nunito",system-ui,sans-serif',
              fontSize: 18,
              fontWeight: 600,
              color: '#000',
            }}
          >
            Quick Pricer
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
            }}
          >
            optimal blue
          </span>
          <div style={{ flex: 1 }} />
          <a
            href={PRICER_FALLBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: '#525252',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 9999,
              border: '1px solid #d4d4d4',
            }}
          >
            Open full pricer
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

        {/* 4-section search grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          {/* SECTION 1: Borrower */}
          <div style={SECTION_CARD}>
            <div style={SECTION_TITLE}>1 · Borrower</div>
            <div>
              <label style={FIELD_LABEL}>FICO Score</label>
              <input
                type="number"
                value={scenario.fico}
                onChange={(e) => update('fico', Number(e.target.value))}
                style={FIELD_INPUT}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
              <input
                type="checkbox"
                checked={scenario.selfEmployed}
                onChange={(e) => update('selfEmployed', e.target.checked)}
              />
              Self-Employed
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
              <input
                type="checkbox"
                checked={scenario.foreignNational}
                onChange={(e) => update('foreignNational', e.target.checked)}
              />
              Foreign National
            </label>
          </div>

          {/* SECTION 2: Property */}
          <div style={SECTION_CARD}>
            <div style={SECTION_TITLE}>2 · Property</div>
            <div>
              <label style={FIELD_LABEL}>Address</label>
              <input
                type="text"
                placeholder="123 Main St, City"
                value={scenario.propertyAddress}
                onChange={(e) => update('propertyAddress', e.target.value)}
                style={FIELD_INPUT}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={FIELD_LABEL}>State</label>
                <input
                  type="text"
                  placeholder="FL"
                  maxLength={2}
                  value={scenario.propertyState}
                  onChange={(e) => update('propertyState', e.target.value.toUpperCase())}
                  style={FIELD_INPUT}
                />
              </div>
              <div>
                <label style={FIELD_LABEL}>Units</label>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={scenario.units}
                  onChange={(e) => update('units', Number(e.target.value))}
                  style={FIELD_INPUT}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={FIELD_LABEL}>Property Type</label>
                <select
                  value={scenario.propertyType}
                  onChange={(e) => update('propertyType', e.target.value)}
                  style={FIELD_INPUT}
                >
                  <option value="SingleFamily">Single Family</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhome">Townhome</option>
                  <option value="MultiFamily">Multi-Family</option>
                  <option value="Condotel">Condotel</option>
                  <option value="NonWarrantable">Non-Warrantable Condo</option>
                </select>
              </div>
              <div>
                <label style={FIELD_LABEL}>Occupancy</label>
                <select
                  value={scenario.occupancy}
                  onChange={(e) => update('occupancy', e.target.value)}
                  style={FIELD_INPUT}
                >
                  <option value="Investment">Investment</option>
                  <option value="SecondHome">Second Home</option>
                  <option value="Primary">Primary</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Loan */}
          <div style={SECTION_CARD}>
            <div style={SECTION_TITLE}>3 · Loan</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={FIELD_LABEL}>Loan Amount ($)</label>
                <input
                  type="number"
                  value={scenario.loanAmount}
                  onChange={(e) => update('loanAmount', Number(e.target.value))}
                  style={FIELD_INPUT}
                />
              </div>
              <div>
                <label style={FIELD_LABEL}>LTV (%)</label>
                <input
                  type="number"
                  min={1}
                  max={95}
                  value={scenario.ltv}
                  onChange={(e) => update('ltv', Number(e.target.value))}
                  style={FIELD_INPUT}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={FIELD_LABEL}>Purpose</label>
                <select
                  value={scenario.loanPurpose}
                  onChange={(e) =>
                    update('loanPurpose', e.target.value as Scenario['loanPurpose'])
                  }
                  style={FIELD_INPUT}
                >
                  <option value="Purchase">Purchase</option>
                  <option value="RateTerm">Rate / Term Refi</option>
                  <option value="CashOut">Cash-Out Refi</option>
                </select>
              </div>
              <div>
                <label style={FIELD_LABEL}>Doc Type</label>
                <select
                  value={scenario.docType}
                  onChange={(e) => update('docType', e.target.value)}
                  style={FIELD_INPUT}
                >
                  <option value="DSCR">DSCR</option>
                  <option value="Full">Full Doc</option>
                  <option value="BankStatement">Bank Statement</option>
                  <option value="P&L">P&amp;L Only</option>
                  <option value="1099">1099</option>
                  <option value="WVOE">WVOE</option>
                  <option value="AssetDepletion">Asset Depletion</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Rate Lock */}
          <div style={SECTION_CARD}>
            <div style={SECTION_TITLE}>4 · Rate Lock</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={FIELD_LABEL}>Lock Period (days)</label>
                <select
                  value={scenario.lockPeriod}
                  onChange={(e) => update('lockPeriod', Number(e.target.value))}
                  style={FIELD_INPUT}
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={60}>60</option>
                </select>
              </div>
              <div>
                <label style={FIELD_LABEL}>Buydown</label>
                <select
                  value={scenario.buydown}
                  onChange={(e) => update('buydown', e.target.value)}
                  style={FIELD_INPUT}
                >
                  <option value="None">None</option>
                  <option value="1-0">1-0</option>
                  <option value="2-1">2-1</option>
                  <option value="3-2-1">3-2-1</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result panel — full width below the grid */}
          <div style={{ ...SECTION_CARD, gridColumn: '1 / -1', minHeight: 100 }}>
            <div style={SECTION_TITLE}>Quote</div>
            {!result && !busy && (
              <div style={{ fontSize: 13, color: '#737373' }}>
                Fill the four sections above and click Quote to pull live pricing from Optimal Blue.
              </div>
            )}
            {busy && (
              <div style={{ fontSize: 13, color: '#525252' }}>Pulling rates from Optimal Blue…</div>
            )}
            {result && result.ok && (
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: 12.5,
                  fontFamily: 'ui-monospace,"JetBrains Mono",monospace',
                  background: '#fafafa',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid #e5e5e5',
                  margin: 0,
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
            {result && !result.ok && (
              <div
                style={{
                  fontSize: 13,
                  color: '#b91c1c',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: 12,
                  borderRadius: 10,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Pricer error</div>
                <div style={{ marginBottom: 8, wordBreak: 'break-word' }}>{result.error}</div>
                {result.fallbackUrl && (
                  <a
                    href={result.fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 9999,
                      background: '#000',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: 12,
                    }}
                  >
                    Open full pricer →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Quote button */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #e5e5e5',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              height: 38,
              padding: '0 18px',
              borderRadius: 9999,
              background: 'transparent',
              border: '1px solid #d4d4d4',
              color: '#525252',
              fontSize: 13.5,
              cursor: busy ? 'default' : 'pointer',
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            style={{
              height: 38,
              padding: '0 22px',
              borderRadius: 9999,
              background: busy ? '#737373' : '#000',
              border: 0,
              color: '#fff',
              fontSize: 13.5,
              fontWeight: 500,
              cursor: busy ? 'default' : 'pointer',
            }}
          >
            {busy ? 'Pulling…' : 'Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}
