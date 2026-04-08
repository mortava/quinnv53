/**
 * TQL Smart Equity — Closed End 2nd Mortgage (HELOAN)
 * Program: TQL Smart Equity / Closed End 2nd Lien — Full Doc, Alt Doc, DSCR
 * Lender: Total Quality Lending
 * Version: 2026-03-29
 * Auto-generated for Gemini AI App — RAG/Hybrid RAG retrieval
 * Generated: 2026-03-29
 *
 * Usage:
 *   import { tqlSmartEquity2ndLien } from "./tqlSmartEquity2ndLien";
 *   const chunks = tqlSmartEquity2ndLien.chunks; // pass to Gemini embeddings
 */

import type { KnowledgeDocument } from "./knowledge_types";

export const tqlSmartEquity2ndLien: KnowledgeDocument = {
  metadata: {
    id: 'tqlSmartEquity2ndLien',
    title: 'TQL Smart Equity — Closed End 2nd Mortgage (HELOAN)',
    program: 'TQL Smart Equity / Closed End 2nd Lien — Full Doc, Alt Doc, DSCR',
    docType: 'ltv_matrix_and_program_guidelines',
    productLine: 'Closed End Second Mortgage',
    version: '2026-03-29',
    lender: 'Total Quality Lending',
    tags: ['second-lien', 'heloan', 'smart-equity', 'closed-end-second', 'cltv', 'full-doc', 'alt-doc', 'dscr', 'bank-statement', 'primary-residence', 'second-home', 'investment', 'rag-optimized'],
    totalChunks: 14,
    generatedAt: '2026-03-29T00:00:00Z',
  },
  chunks: [
    {
      id: 'tqlSmartEquity2ndLien-000',
      section: 'TQL Smart Equity — Closed End 2nd Mortgage (HELOAN)',
      headingLevel: 1,
      content: `**Program:** Total Quality Mortgage — Closed End 2nd Mortgage (SMART EQUITY)
**Doc Types:** Full Doc / Alt Doc (Income Qualifying) + DSCR (Business Purpose)
**Use:** LLM RAG / Hybrid RAG — CLTV lookup and program rule retrieval for 2nd lien scenarios.
⚠️ *Confirm current pricing and state eligibility with TQL AE before quoting.*

---`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 0,
    },
    {
      id: 'tqlSmartEquity2ndLien-001',
      section: 'CLTV Matrix — Fixed Rate 2nd Lien (HELOAN IQ — Income Qualifying)',
      headingLevel: 2,
      content: `**Product:** Fixed Rate 2nd Lien | Full Doc / Alt Doc Income Qualifying
**Columns:** Min FICO | Occupancy | Loan Amount Range | Max CLTV`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 1,
    },
    {
      id: 'tqlSmartEquity2ndLien-002',
      section: 'Loan Amount: > $50,000 – ≤ $350,000',
      headingLevel: 3,
      content: `| Min FICO | Occupancy | Loan Amount | Max CLTV |
|---|---|---|---|
| 700+ | Primary Residence | > $50,000 – ≤ $350,000 | **90%** |
| 700+ | Second Home | > $50,000 – ≤ $350,000 | **85%** |
| 700+ | Investment | > $50,000 – ≤ $350,000 | **80%** |
| 680+ | Primary Residence | > $50,000 – ≤ $350,000 | **85%** |
| 680+ | Second Home | > $50,000 – ≤ $350,000 | **80%** |
| 680+ | Investment | > $50,000 – ≤ $350,000 | **80%** |
| 660+ | Primary Residence | > $50,000 – ≤ $350,000 | **80%** |
| 660+ | Second Home | > $50,000 – ≤ $350,000 | **70%** |
| 660+ | Investment | > $50,000 – ≤ $350,000 | **70%** |`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 2,
    },
    {
      id: 'tqlSmartEquity2ndLien-003',
      section: 'Loan Amount: > $350,001 – ≤ $500,000',
      headingLevel: 3,
      content: `| Min FICO | Occupancy | Loan Amount | Max CLTV |
|---|---|---|---|
| 720+ | Primary Residence | > $350,001 – ≤ $500,000 | **90%** |
| 720+ | Second Home | > $350,001 – ≤ $500,000 | **80%** |
| 720+ | Investment | > $350,001 – ≤ $500,000 | **80%** |
| 700+ | Primary Residence | > $350,001 – ≤ $500,000 | **85%** |
| 700+ | Second Home | > $350,001 – ≤ $500,000 | **80%** |
| 700+ | Investment | > $350,001 – ≤ $500,000 | **80%** |
| 660+ | Primary Residence | > $350,001 – ≤ $500,000 | **75%** |
| 660+ | Second Home | > $350,001 – ≤ $500,000 | **70%** |
| 660+ | Investment | > $350,001 – ≤ $500,000 | **70%** |`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 3,
    },
    {
      id: 'tqlSmartEquity2ndLien-004',
      section: 'Loan Amount: > $500,001 – ≤ $750,000',
      headingLevel: 3,
      content: `| Min FICO | Occupancy | Loan Amount | Max CLTV |
|---|---|---|---|
| 720+ | Primary Residence | > $500,001 – ≤ $750,000 | **80%** |
| 720+ | Second Home | > $500,001 – ≤ $750,000 | **75%** |
| 700+ | Primary Residence | > $500,001 – ≤ $750,000 | **75%** |
| 700+ | Second Home | > $500,001 – ≤ $750,000 | **70%** |

---`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 4,
    },
    {
      id: 'tqlSmartEquity2ndLien-005',
      section: 'CLTV Matrix — DSCR Investment (Business Purpose)',
      headingLevel: 2,
      content: `**Product:** DSCR 2nd Lien | Investor Only | DSCR >= 1.00 required

| Min FICO | Occupancy | Loan Amount | Max CLTV |
|---|---|---|---|
| 720+ | Investment (DSCR >= 1.00) | > $75,000 – ≤ $500,000 | **80%** |
| 700+ | Investment (DSCR >= 1.00) | > $75,000 – ≤ $500,000 | **75%** |
| 680+ | Investment (DSCR >= 1.00) | > $75,000 – ≤ $500,000 | **70%** |

---`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 5,
    },
    {
      id: 'tqlSmartEquity2ndLien-006',
      section: 'General Program Requirements',
      headingLevel: 2,
      content: `**Program:** Closed End Fixed Rate Second Mortgage (2nd Lien) — Smart Equity Data Card

**Q: What does CLTV mean in this matrix?**

A: **CLTV** (Combined Loan to Value) is the maximum combined loan-to-value across all loans on the property. It represents the total of the 1st lien balance plus the new 2nd lien, divided by the property's appraised value.

**Q: What transaction types are allowed?**

A: Standalone Second only. Exceptions are **not allowed** on this program — all guidelines must be followed as written.

**Q: What loan product terms are available?**`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 6,
    },
    {
      id: 'tqlSmartEquity2ndLien-007',
      section: 'General Program Requirements',
      headingLevel: 2,
      content: `A: 10, 20, and 30-year **Fixed Rate**. Also available: **Interest Only (I/O)** — 25/30-year term with first 5 years I/O, then converts to a fixed-rate payment for the remaining amortization term (e.g., a 25-year I/O after 5 years becomes a 20-year fixed rate).

**Q: What occupancy types are eligible?**

A: **HELOAN IQ** (Income Qualifying): Primary Residence, Second Home, Investor — Income Qualifying. **HELOAN DSCR**: Investor (Business Purpose only).

**Q: What income documentation types are allowed?**`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 7,
    },
    {
      id: 'tqlSmartEquity2ndLien-008',
      section: 'General Program Requirements',
      headingLevel: 2,
      content: `A:
- **Full Doc:** Standard 1 or 2 years W-2 or Tax Returns
- **Alt Doc (Self-Employed):**
  - 12-month Personal or Business Bank Statements
  - 12-month 1099 Income + WVOE or last 2 months Bank Statements
  - 12-month CPA/Licensed Accountant P&L + last 2 months Bank Statements
  - 12-month CPA/Licensed Accountant P&L only (no Bank Statements)
  - Asset Depletion or Asset Utilization
- **DSCR** (Debt Service Coverage Ratio)

**Q: What property types are eligible and ineligible?**

A:
- **Eligible:** SFR, PUD, Townhome, 2–4 Units, Warrantable Condos (not allowed on Smart Equity DSCR)
- **Ineligible:** Condotels, Commercial/Agricultural, Leasehold Properties, Land Trusts, Rural, Age-Restricted Communities, Hobby Farms, Modular, Land Contract, Log Homes, Leasehold Estates`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 8,
    },
    {
      id: 'tqlSmartEquity2ndLien-009',
      section: 'General Program Requirements',
      headingLevel: 2,
      content: `**Q: What are the credit event seasoning requirements?**

A: **BK / FC / SS / DIL seasoning:** > 48 months. **Mortgage history:** 0x30x12 (no 30-day lates in last 12 months).

**Q: What are the ownership/seasoning requirements for refinances?**

A:
- **Primary Residence:** No ownership seasoning required. If less than 6 months seasoning → 10% CLTV reduction from matrix.
- **Second Home & Investment:** Minimum 6 months ownership seasoning required (measured from Note date). Min 6 months since most recent mortgage transaction (purchase or refi).
- Appraised value may be used for LTV once seasoning requirements are met.

**Q: What citizenship types are eligible?**

A: U.S. Citizens, Permanent Resident Aliens, Non-Permanent Resident Aliens (with a SSN).

**Q: What are the title policy requirements?**`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 9,
    },
    {
      id: 'tqlSmartEquity2ndLien-010',
      section: 'General Program Requirements',
      headingLevel: 2,
      content: `A: Loan amounts ≤ $400,000 → Short Form Report. Loan amounts > $400,000 → Full Title Policy.

**Q: What are the Interest Only (I/O) eligibility criteria?**

A: **Min 700 FICO.** Primary Residence only. Current 1st lien must be fully amortizing. **Max LTV 75%.**

**Q: What are the credit score and tradeline requirements?**

A: **Qualifying Score:** Mid score of primary wage earner.
- **Standard Tradelines:** 3 tradelines reporting 12+ months, OR 2 tradelines reporting 24+ months with activity in last 12 months, OR 1 tradeline reporting 36+ months with activity in last 12 months (36-month tradeline must be a mortgage or installment account).
- All acceptable tradelines must show **0x60** in the most recent 12 months from application date.
- **Limited Tradelines:** Primary Occupancy only.`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 10,
    },
    {
      id: 'tqlSmartEquity2ndLien-011',
      section: 'General Program Requirements',
      headingLevel: 2,
      content: `**Q: What are the appraisal and AVM requirements?**

A:
- **Loan Amount ≤ $400,000:** AVM (ordered through DEFY portal, assigned to Clear Capital Corp.) + Defy-approved AMC Vendor Property Condition Report. AVM must result in a Confidence Rating: Clear Capital ≥ 90% / ≤ 0.10. **OR** Full interior appraisal (FNMA Form 1004, 1073, or 1025).
- **Loan Amount > $400,000:** Full interior appraisal (FNMA Form 1004, 1073, or 1025) required.
- **Other:** Appraisal Waivers not allowed. HPML loans require full interior appraisal. Solar panel agreements allowed per FNMA guidelines; properties where solar panels carry a lien are **not eligible**.

**Q: Are listed properties eligible?**

A: No. Properties listed for sale or listed in the prior 6 months from application are **ineligible**.`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 11,
    },
    {
      id: 'tqlSmartEquity2ndLien-012',
      section: 'General Program Requirements',
      headingLevel: 2,
      content: `**Q: What hazard insurance coverage is required?**

A: 100% replacement cost or updated coverage sufficient to cover **both the 1st and 2nd lien** is required.

---`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 12,
    },
    {
      id: 'tqlSmartEquity2ndLien-013',
      section: 'State Eligibility',
      headingLevel: 2,
      content: `**Q: Which states are eligible for HELOAN IQ (Full / Alt Doc — Income Qualifying)?**

A: AL, AZ, CA, CO, CT, FL, GA, ID, IL, IN, IA, MI, MN, NC, OH, OK, OR, SC, TN, TX, VA, WA, WI

**Q: Which states are eligible for HELOAN DSCR (DSCR >= 1.00 — Business Purpose)?**

A: AL, AR, CA, CO, CT, DE, DC, FL, GA, HI, IN, IA, KS, KY, LA, ME, MD, MA, MO, MT, NE, NH, NJ, NM, OH, OK, PA, RI, SC, TN, TX, VA, WA, WV, WI, WY

**Q: Which states or areas are ineligible?**

A:
- **NY** — Full state ineligible
- **HI** — Lava zones 1 & 2 ineligible
- **MD** — Baltimore City Limits ineligible
- **PA** — Philadelphia City Limits ineligible

---`,
      sourceDocId: 'tqlSmartEquity2ndLien',
      chunkIndex: 13,
    },
  ],
};

export default tqlSmartEquity2ndLien;
