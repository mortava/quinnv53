/**
 * Inline Pricer Panel — full 4-section search form matching the design
 * extracted from mortava/quinnpriceflash55. Sections:
 *
 *   1. Loan Information   (12 fields)
 *   2. Property Details   (12 fields)
 *   3. Borrower Details   (5 fields + 3 pill toggles)
 *   4. Investor Details   (DSCR-conditional) + Get Pricing
 *
 * Submission body shape matches /api/pricer/quote (the OB v4 QMPricingRequest
 * builder copied from the flash repo).
 */

import React, { useMemo, useState } from 'react';

const PRICER_FALLBACK_URL =
  (process.env.VITE_TQL_PRICER_URL as string) || 'https://submit.tqltpo.com';

interface PricerPanelProps {
  onClose: () => void;
}

interface FormData {
  // Loan Information
  lienPosition: string;
  loanPurpose: string;
  propertyValue: string;
  loanAmount: string;
  ltv: string;
  loanTerm: string;
  amortization: string;
  paymentType: string;
  impoundType: string;
  lockPeriod: string;
  cashoutAmount: string;
  // Property Details
  occupancyType: string;
  propertyType: string;
  numberOfUnits: string;
  propertyZip: string;
  propertyState: string;
  propertyCounty: string;
  propertyCity: string;
  structureType: string;
  isRuralProperty: boolean;
  isMixedUsePML: boolean;
  is5PlusUnits: boolean;
  acreage: string;
  // Borrower Details
  creditScore: string;
  dti: string;
  citizenship: string;
  documentationType: string;
  hasNonOccupantCoBorrower: boolean;
  isSelfEmployed: boolean;
  isFTHB: boolean;
  hasITIN: boolean;
  // Investor Details
  prepayPeriod: string;
  prepayType: string;
  isVacant: boolean;
  dscrEntityType: string;
  dscrManualInput: string;
  isShortTermRental: boolean;
}

const DEFAULT_FORM: FormData = {
  // Loan
  lienPosition: '1st',
  loanPurpose: 'purchase',
  propertyValue: '800,000',
  loanAmount: '600,000',
  ltv: '75',
  loanTerm: '30',
  amortization: 'fixed',
  paymentType: 'pi',
  impoundType: 'escrowed',
  lockPeriod: '30',
  cashoutAmount: '',
  // Property
  occupancyType: 'investment',
  propertyType: 'sfr',
  numberOfUnits: '1',
  propertyZip: '90210',
  propertyState: 'CA',
  propertyCounty: 'Los Angeles',
  propertyCity: 'Beverly Hills',
  structureType: 'detached',
  isRuralProperty: false,
  isMixedUsePML: false,
  is5PlusUnits: false,
  acreage: '<5',
  // Borrower
  creditScore: '740',
  dti: '36',
  citizenship: 'usCitizen',
  documentationType: 'dscr',
  hasNonOccupantCoBorrower: false,
  isSelfEmployed: true,
  isFTHB: false,
  hasITIN: false,
  // Investor
  prepayPeriod: '60mo',
  prepayType: '3pct',
  isVacant: false,
  dscrEntityType: 'individual',
  dscrManualInput: '1.000',
  isShortTermRental: false,
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

function formatNumberInput(v: string): string {
  const digits = v.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

interface QuoteResult {
  ok: boolean;
  data?: unknown;
  error?: string;
  fallbackUrl?: string;
  scenario?: unknown;
}

const COL: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
const LABEL: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 500,
  color: '#171717',
};
const INPUT: React.CSSProperties = {
  height: 38,
  padding: '0 12px',
  borderRadius: 8,
  border: '1px solid #d4d4d4',
  outline: 'none',
  fontSize: 13.5,
  background: '#fff',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
};
const SECTION: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: 14,
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};
const SECTION_TITLE: React.CSSProperties = {
  fontFamily: '"SF Pro Rounded","Nunito",system-ui,sans-serif',
  fontSize: 14,
  fontWeight: 600,
  color: '#000',
  paddingBottom: 8,
  borderBottom: '1px solid #e5e5e5',
  marginBottom: 4,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
const PILL_BUTTON = (active: boolean): React.CSSProperties => ({
  padding: '6px 16px',
  borderRadius: 9999,
  border: `1px solid ${active ? '#0F766E' : '#d4d4d4'}`,
  background: active ? '#0F766E' : '#f5f5f5',
  color: active ? '#fff' : '#737373',
  fontSize: 12.5,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all .15s',
});

export default function PricerPanel({ onClose }: PricerPanelProps) {
  const [f, setF] = useState<FormData>(DEFAULT_FORM);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]): void =>
    setF((s) => ({ ...s, [k]: v }));

  // CLTV mirrors LTV until 2nd-lien gets wired
  const cltv = f.ltv ? `${f.ltv}%` : '—';

  const showInvestor =
    f.documentationType === 'dscr' ||
    f.occupancyType === 'investment' ||
    f.documentationType !== 'fullDoc';

  const submit = async (): Promise<void> => {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/pricer/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...f,
          loanAmount: f.loanAmount.replace(/,/g, ''),
          propertyValue: f.propertyValue.replace(/,/g, ''),
          cashoutAmount: f.cashoutAmount.replace(/,/g, ''),
        }),
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

  const rateRows = useMemo(() => {
    if (!result?.ok || !result.data) return [];
    // OB v4 returns a complex shape; flatten the first 12 results we can find
    const data = result.data as Record<string, unknown>;
    const rates: Array<{ rate?: number; price?: number; lender?: string; program?: string }> = [];
    const visit = (node: unknown): void => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        for (const child of node) visit(child);
        return;
      }
      const obj = node as Record<string, unknown>;
      if (typeof obj.rate === 'number' && (obj.companyName || obj.programName)) {
        rates.push({
          rate: obj.rate as number,
          price:
            typeof obj.adjustedPoints === 'number' ? 100 - (obj.adjustedPoints as number) : undefined,
          lender: (obj.companyName as string) || undefined,
          program: (obj.programName as string) || undefined,
        });
      }
      for (const v of Object.values(obj)) visit(v);
    };
    visit(data);
    return rates.slice(0, 24);
  }, [result]);

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
          background: '#fafafa',
          borderRadius: 18,
          width: '100%',
          maxWidth: 1280,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
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
              fontSize: 18,
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
            }}
          >
            optimal blue · v4
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

        {/* Body — scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* SECTION 1: Loan Information */}
          <section style={SECTION}>
            <div style={SECTION_TITLE}>1 · Loan Information</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              <div style={COL}>
                <label style={LABEL}>Lien Position</label>
                <select style={INPUT} value={f.lienPosition} onChange={(e) => set('lienPosition', e.target.value)}>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="heloc">HELOC</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Loan Purpose *</label>
                <select style={INPUT} value={f.loanPurpose} onChange={(e) => set('loanPurpose', e.target.value)}>
                  <option value="purchase">Purchase</option>
                  <option value="refinance">Refi Rate/Term</option>
                  <option value="cashout">Refinance Cashout</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Value/Sales Price *</label>
                <input style={INPUT} value={f.propertyValue} onChange={(e) => set('propertyValue', formatNumberInput(e.target.value))} />
              </div>
              <div style={COL}>
                <label style={LABEL}>Loan Amount *</label>
                <input style={INPUT} value={f.loanAmount} onChange={(e) => set('loanAmount', formatNumberInput(e.target.value))} />
              </div>
              <div style={COL}>
                <label style={LABEL}>LTV</label>
                <input style={INPUT} value={f.ltv} onChange={(e) => set('ltv', e.target.value.replace(/[^0-9.]/g, ''))} />
              </div>
              <div style={COL}>
                <label style={LABEL}>CLTV</label>
                <div style={{ ...INPUT, display: 'flex', alignItems: 'center', background: '#fafafa', color: '#737373' }}>
                  {cltv}
                </div>
              </div>
              <div style={COL}>
                <label style={LABEL}>Loan Term *</label>
                <select style={INPUT} value={f.loanTerm} onChange={(e) => set('loanTerm', e.target.value)}>
                  <option value="30">30 Year</option>
                  <option value="40">40 Year</option>
                  <option value="20">20 Year</option>
                  <option value="15">15 Year</option>
                  <option value="10">10 Year</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Amortization</label>
                <select style={INPUT} value={f.amortization} onChange={(e) => set('amortization', e.target.value)}>
                  <option value="fixed">Fixed</option>
                  <option value="arm5">ARM (HELOC)</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Payment</label>
                <select style={INPUT} value={f.paymentType} onChange={(e) => set('paymentType', e.target.value)}>
                  <option value="pi">P&amp;I</option>
                  <option value="io">Interest Only</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Impound Type</label>
                <select style={INPUT} value={f.impoundType} onChange={(e) => set('impoundType', e.target.value)}>
                  <option value="escrowed">Taxes and Insurance Escrowed</option>
                  <option value="noescrow">No Escrow</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Lock Period</label>
                <select style={INPUT} value={f.lockPeriod} onChange={(e) => set('lockPeriod', e.target.value)}>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Cashout Amount</label>
                <input style={INPUT} value={f.cashoutAmount} onChange={(e) => set('cashoutAmount', formatNumberInput(e.target.value))} />
              </div>
            </div>
          </section>

          {/* SECTION 2: Property Details */}
          <section style={SECTION}>
            <div style={SECTION_TITLE}>2 · Property Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0,1fr))', gap: 12 }}>
              <div style={COL}>
                <label style={LABEL}>Property Use *</label>
                <select style={INPUT} value={f.occupancyType} onChange={(e) => set('occupancyType', e.target.value)}>
                  <option value="primary">Primary Residence</option>
                  <option value="secondary">Second Home</option>
                  <option value="investment">Investment</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Property Type *</label>
                <select style={INPUT} value={f.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
                  <option value="sfr">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="non-warrantable-condo">Non-Warrantable Condo</option>
                  <option value="condotel">Condotel</option>
                  <option value="coop">Co-op</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="2unit">2 Unit</option>
                  <option value="3unit">3 Unit</option>
                  <option value="4unit">4 Unit</option>
                  <option value="5-8unit">MultiFamily 5-8</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Number of Units</label>
                <select style={INPUT} value={f.numberOfUnits} onChange={(e) => set('numberOfUnits', e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>ZIP Code *</label>
                <input style={INPUT} maxLength={5} value={f.propertyZip} onChange={(e) => set('propertyZip', e.target.value.replace(/\D/g, ''))} />
              </div>
              <div style={COL}>
                <label style={LABEL}>State *</label>
                <select style={INPUT} value={f.propertyState} onChange={(e) => set('propertyState', e.target.value)}>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>County</label>
                <input style={INPUT} value={f.propertyCounty} onChange={(e) => set('propertyCounty', e.target.value)} />
              </div>
              <div style={COL}>
                <label style={LABEL}>City</label>
                <input style={INPUT} value={f.propertyCity} onChange={(e) => set('propertyCity', e.target.value)} />
              </div>
              <div style={COL}>
                <label style={LABEL}>Structure Type</label>
                <select style={INPUT} value={f.structureType} onChange={(e) => set('structureType', e.target.value)}>
                  <option value="detached">Detached</option>
                  <option value="attached">Attached</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Rural Property</label>
                <select
                  style={INPUT}
                  value={f.isRuralProperty ? 'yes' : 'no'}
                  onChange={(e) => set('isRuralProperty', e.target.value === 'yes')}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Mixed Use</label>
                <select
                  style={INPUT}
                  value={f.isMixedUsePML ? 'yes' : 'no'}
                  onChange={(e) => set('isMixedUsePML', e.target.value === 'yes')}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>5+ Units</label>
                <select
                  style={INPUT}
                  value={f.is5PlusUnits ? 'yes' : 'no'}
                  onChange={(e) => set('is5PlusUnits', e.target.value === 'yes')}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Acreage</label>
                <select style={INPUT} value={f.acreage} onChange={(e) => set('acreage', e.target.value)}>
                  <option value="<5">&lt;5</option>
                  <option value="6-10">6-10</option>
                  <option value="10-15">10-15</option>
                  <option value="15-20">15-20</option>
                  <option value=">20">&gt;20</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 3: Borrower Details */}
          <section style={SECTION}>
            <div style={SECTION_TITLE}>3 · Borrower Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12 }}>
              <div style={COL}>
                <label style={LABEL}>Credit Score *</label>
                <input
                  style={INPUT}
                  maxLength={3}
                  value={f.creditScore}
                  onChange={(e) => set('creditScore', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div style={COL}>
                <label style={LABEL}>DTI % *</label>
                <input
                  style={INPUT}
                  maxLength={2}
                  value={f.dti}
                  onChange={(e) => set('dti', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div style={COL}>
                <label style={LABEL}>Citizenship</label>
                <select style={INPUT} value={f.citizenship} onChange={(e) => set('citizenship', e.target.value)}>
                  <option value="usCitizen">US Citizen</option>
                  <option value="permanentResident">Permanent Resident</option>
                  <option value="nonPermanentResident">Non-Permanent Resident</option>
                  <option value="foreignNational">Foreign National</option>
                  <option value="itin">ITIN</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Doc Type</label>
                <select style={INPUT} value={f.documentationType} onChange={(e) => set('documentationType', e.target.value)}>
                  <option value="fullDoc">Full Document</option>
                  <option value="dscr">Debt Service Coverage (DSCR)</option>
                  <option value="bankStatement12">12 Mo. Bank Statements</option>
                  <option value="bankStatement24">24 Mo. Bank Statements</option>
                  <option value="bankStatementOther">Other Bank Statements</option>
                  <option value="taxReturns1Yr">1 Yr. Tax Returns</option>
                  <option value="voe">VOE</option>
                  <option value="assetUtilization">Asset Utilization</option>
                  <option value="noRatio">No Ratio</option>
                </select>
              </div>
              <div style={COL}>
                <label style={LABEL}>Non-Occ Co Borrower</label>
                <select
                  style={INPUT}
                  value={f.hasNonOccupantCoBorrower ? 'yes' : 'no'}
                  onChange={(e) => set('hasNonOccupantCoBorrower', e.target.value === 'yes')}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" style={PILL_BUTTON(f.isSelfEmployed)} onClick={() => set('isSelfEmployed', !f.isSelfEmployed)}>
                Self Employed
              </button>
              <button type="button" style={PILL_BUTTON(f.isFTHB)} onClick={() => set('isFTHB', !f.isFTHB)}>
                FTHB
              </button>
              <button type="button" style={PILL_BUTTON(f.hasITIN)} onClick={() => set('hasITIN', !f.hasITIN)}>
                Has ITIN
              </button>
            </div>
          </section>

          {/* SECTION 4: Investor Details */}
          {showInvestor && (
            <section style={SECTION}>
              <div style={SECTION_TITLE}>4 · Investor Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0,1fr))', gap: 12 }}>
                <div style={COL}>
                  <label style={LABEL}>Prepay Period</label>
                  <select style={INPUT} value={f.prepayPeriod} onChange={(e) => set('prepayPeriod', e.target.value)}>
                    <option value="60mo">5 Year</option>
                    <option value="48mo">4 Year</option>
                    <option value="36mo">3 Year</option>
                    <option value="24mo">2 Year</option>
                    <option value="12mo">1 Year</option>
                    <option value="0mo">None</option>
                  </select>
                </div>
                <div style={COL}>
                  <label style={LABEL}>Prepay Type</label>
                  <select style={INPUT} value={f.prepayType} onChange={(e) => set('prepayType', e.target.value)}>
                    <option value="5pct">5%</option>
                    <option value="3pct">3%</option>
                    <option value="6mo-interest">6 Mo. Interest</option>
                    <option value="declining-3yr">Declining 3yr (3-2-1%)</option>
                  </select>
                </div>
                {f.loanPurpose !== 'purchase' && (
                  <div style={COL}>
                    <label style={LABEL}>Vacant</label>
                    <select
                      style={INPUT}
                      value={f.isVacant ? 'yes' : 'no'}
                      onChange={(e) => set('isVacant', e.target.value === 'yes')}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                )}
                {f.documentationType === 'dscr' && (
                  <>
                    <div style={COL}>
                      <label style={LABEL}>DSCR Entity Type</label>
                      <select style={INPUT} value={f.dscrEntityType} onChange={(e) => set('dscrEntityType', e.target.value)}>
                        <option value="individual">Individual</option>
                        <option value="llc">LLC</option>
                        <option value="corp">Corp.</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div style={COL}>
                      <label style={LABEL}>DSCR Ratio</label>
                      <input
                        style={INPUT}
                        placeholder="1.000"
                        value={f.dscrManualInput}
                        onChange={(e) => set('dscrManualInput', e.target.value.replace(/[^0-9.]/g, ''))}
                      />
                    </div>
                  </>
                )}
                <div style={COL}>
                  <label style={LABEL}>Short Term Rental</label>
                  <select
                    style={INPUT}
                    value={f.isShortTermRental ? 'yes' : 'no'}
                    onChange={(e) => set('isShortTermRental', e.target.value === 'yes')}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* RESULT */}
          {(busy || result) && (
            <section style={SECTION}>
              <div style={SECTION_TITLE}>Quote Results</div>
              {busy && <div style={{ fontSize: 13, color: '#525252' }}>Pulling rates from Optimal Blue…</div>}
              {result && result.ok && rateRows.length > 0 && (
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#fafafa', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid #e5e5e5' }}>Lender</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid #e5e5e5' }}>Program</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid #e5e5e5', textAlign: 'right' }}>Rate</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid #e5e5e5', textAlign: 'right' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateRows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px 12px' }}>{r.lender}</td>
                          <td style={{ padding: '8px 12px', color: '#525252', fontSize: 12 }}>{r.program}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'ui-monospace,monospace' }}>
                            {r.rate?.toFixed(3)}%
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'ui-monospace,monospace' }}>
                            {r.price?.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {result && result.ok && rateRows.length === 0 && (
                <pre
                  style={{
                    fontSize: 11.5,
                    fontFamily: 'ui-monospace,"JetBrains Mono",monospace',
                    background: '#fafafa',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #e5e5e5',
                    margin: 0,
                    maxHeight: 280,
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
                        padding: '6px 14px',
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
            </section>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #e5e5e5',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              height: 40,
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
              height: 40,
              padding: '0 22px',
              borderRadius: 9999,
              background: busy ? '#737373' : '#0F766E',
              border: 0,
              color: '#fff',
              fontSize: 13.5,
              fontWeight: 500,
              cursor: busy ? 'default' : 'pointer',
            }}
          >
            {busy ? 'Pulling…' : 'Get Pricing'}
          </button>
        </div>
      </div>
    </div>
  );
}
