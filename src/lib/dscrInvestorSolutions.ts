/**
 * Investor Solutions DSCR — Q&A Knowledge Base
 * Program: Investor Solutions DSCR (1-4 Unit)
 * Lender: Total Quality Lending
 * Version: 3.20.2026
 * Auto-generated for Gemini AI App — RAG/Hybrid RAG retrieval
 * Generated: 2026-03-29
 *
 * Usage:
 *   import { dscrInvestorSolutions } from "./dscrInvestorSolutions";
 *   const chunks = dscrInvestorSolutions.chunks; // pass to Gemini embeddings
 */

import type { KnowledgeDocument } from "./types";

export const dscrInvestorSolutions: KnowledgeDocument = {
  metadata: {
    id: 'dscrInvestorSolutions',
    title: 'Investor Solutions DSCR — Q&A Knowledge Base',
    program: 'Investor Solutions DSCR (1-4 Unit)',
    docType: 'qa_knowledge_base',
    productLine: 'DSCR',
    version: '3.20.2026',
    lender: 'Total Quality Lending',
    tags: ['dscr', 'investor-solutions', 'ltv-matrix', 'fico', 'loan-limits', 'str', 'airdna', 'credit-events', 'housing-history', 'underwriting', 'prepayment-penalty', 'escrow', 'rag-optimized', 'qa-format'],
    totalChunks: 26,
    generatedAt: '2026-03-29T00:00:00Z',
  },
  chunks: [
    {
      id: 'dscrInvestorSolutions-000',
      section: 'Investor Solutions DSCR — Q&A Knowledge Base',
      headingLevel: 1,
      content: `**Program:** Investor Solutions DSCR (1–4 Unit) | **Lender:** Total Quality Lending
**Version:** 3.20.2026 | **Doc Type:** Q&A Knowledge Base
**Use:** LLM RAG / Hybrid RAG — question-answer retrieval for DSCR scenario analysis.
⚠️ *Confirm current pricing and overlays with TQL AE before quoting.*

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 0,
    },
    {
      id: 'dscrInvestorSolutions-001',
      section: 'General Requirements',
      headingLevel: 2,
      content: `**Category:** General Requirements | **10 rules**

**Q: What loan purposes are allowed?**

A: Purchase, Rate/Term Refinance, and Cash-Out Refinance.

**Q: What occupancy type is required?**

A: Investment (non-owner occupied).

**Q: What product types are available?**

A: Fixed Rate: 15, 30, 40-year terms. ARM: 5/6, 7/6, 10/6 ARM with 30-year term.

**Q: What are the Interest Only (IO) requirements?**

A: Min Credit Score: 680, Max LTV: 75% Purchase, 75% Rate/Term, 70% Cash-Out. 40-year term ARMs eligible with IO feature.

**Q: What are the minimum and maximum loan amounts?**

A: Min: $100,000. Max: $3,500,000.

**Q: Are there special rules for loan amounts under $150K?**

A: Yes. Max LTV/CLTV: Purchase 70%, any Refinance 65% (Min DSCR 1.00).

**Q: What is the maximum cash-in-hand allowed?**`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 1,
    },
    {
      id: 'dscrInvestorSolutions-002',
      section: 'General Requirements',
      headingLevel: 2,
      content: `A: LTV > 65%: $500,000. LTV ≤ 65%: $1,000,000. Not applicable to Delayed Financing transactions.

**Q: What are the short-term rental LTV adjustments?**

A: 5% LTV reduction from standard matrix, 80% max LTV Purchase/Rate-Term, 70% max LTV Cash-Out.

**Q: What appraisal forms are required?**

A: FNMA Form 1004, 1025, or 1073 with interior/exterior inspection. Appraisal review product required unless 2nd appraisal obtained. 2nd appraisal required for loans > $2,000,000.

**Q: How does DSCR affect cash-out LTV?**

A: DSCR must be above 1.00 for cash-out at 80% LTV. If DSCR is below 1.00, there is a 5% LTV reduction.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 2,
    },
    {
      id: 'dscrInvestorSolutions-003',
      section: 'LTV Matrix (DSCR >= 1.00)',
      headingLevel: 2,
      content: `**Category:** LTV Matrix (DSCR >= 1.00) | **51 rules**

**Q: What is the max LTV for a 740+ FICO, loan up to $2.5M, Purchase?**

A: 80%

**Q: What is the max LTV for a 740+ FICO, loan up to $2.5M, Rate/Term Refi?**

A: 80%

**Q: What is the max LTV for a 740+ FICO, loan up to $2.5M, Cash-Out Refi?**

A: 80%

**Q: What is the max LTV for a 720+ FICO, loan up to $1M, Purchase?**

A: 85%

**Q: What is the max LTV for a 720+ FICO, loan up to $1M, Rate/Term Refi?**

A: 85%

**Q: What is the max LTV for a 720+ FICO, loan up to $1M, Cash-Out Refi?**

A: 80%

**Q: What is the max LTV for a 720+ FICO, loan $1M–$1.5M, Purchase?**

A: 85%

**Q: What is the max LTV for a 720+ FICO, loan $1M–$1.5M, Rate/Term Refi?**

A: 85%

**Q: What is the max LTV for a 720+ FICO, loan $1M–$1.5M, Cash-Out Refi?**

A: 80%`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 3,
    },
    {
      id: 'dscrInvestorSolutions-004',
      section: 'LTV Matrix (DSCR >= 1.00)',
      headingLevel: 2,
      content: `**Q: What is the max LTV for a 700+ FICO, loan up to $1M, Purchase?**

A: 80%

**Q: What is the max LTV for a 700+ FICO, loan up to $1M, Rate/Term Refi?**

A: 75%

**Q: What is the max LTV for a 700+ FICO, loan up to $1M, Cash-Out Refi?**

A: 75%

**Q: What is the max LTV for a 700+ FICO, loan $1M–$1.5M, Purchase?**

A: 80%

**Q: What is the max LTV for a 700+ FICO, loan $1M–$1.5M, Rate/Term Refi?**

A: 75%

**Q: What is the max LTV for a 700+ FICO, loan $1M–$1.5M, Cash-Out Refi?**

A: 75%

**Q: What is the max LTV for a 700+ FICO, loan $1.5M–$2M, Purchase?**

A: 75%

**Q: What is the max LTV for a 700+ FICO, loan $1.5M–$2M, Rate/Term Refi?**

A: 70%

**Q: What is the max LTV for a 700+ FICO, loan $1.5M–$2M, Cash-Out Refi?**

A: 70%

**Q: What is the max LTV for a 700+ FICO, loan $2M–$3M, Purchase?**

A: 70%`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 4,
    },
    {
      id: 'dscrInvestorSolutions-005',
      section: 'LTV Matrix (DSCR >= 1.00)',
      headingLevel: 2,
      content: `**Q: What is the max LTV for a 700+ FICO, loan $2M–$3M, Rate/Term Refi?**

A: 65%

**Q: What is the max LTV for a 700+ FICO, loan $2M–$3M, Cash-Out Refi?**

A: 65%

**Q: What is the max LTV for a 700+ FICO, loan $3M–$3.5M, Purchase?**

A: 70%

**Q: What is the max LTV for a 700+ FICO, loan $3M–$3.5M, Rate/Term Refi?**

A: 65%

**Q: What is the max LTV for a 700+ FICO, loan $3M–$3.5M, Cash-Out Refi?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 660+ FICO, loan up to $1M, Purchase?**

A: 75%

**Q: What is the max LTV for a 660+ FICO, loan up to $1M, Rate/Term Refi?**

A: 75%

**Q: What is the max LTV for a 660+ FICO, loan up to $1M, Cash-Out Refi?**

A: 70%

**Q: What is the max LTV for a 660+ FICO, loan $1M–$1.5M, Purchase?**

A: 75%

**Q: What is the max LTV for a 660+ FICO, loan $1M–$1.5M, Rate/Term Refi?**

A: 70%`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 5,
    },
    {
      id: 'dscrInvestorSolutions-006',
      section: 'LTV Matrix (DSCR >= 1.00)',
      headingLevel: 2,
      content: `**Q: What is the max LTV for a 660+ FICO, loan $1M–$1.5M, Cash-Out Refi?**

A: 70%

**Q: What is the max LTV for a 660+ FICO, loan $1.5M–$2M, Purchase?**

A: 70%

**Q: What is the max LTV for a 660+ FICO, loan $1.5M–$2M, Rate/Term Refi?**

A: 65%

**Q: What is the max LTV for a 660+ FICO, loan $1.5M–$2M, Cash-Out Refi?**

A: 65%

**Q: What is the max LTV for a 660+ FICO, loan $2M–$2.5M, Purchase?**

A: 70%

**Q: What is the max LTV for a 660+ FICO, loan $2M–$2.5M, Rate/Term Refi?**

A: 65%

**Q: What is the max LTV for a 660+ FICO, loan $2M–$2.5M, Cash-Out Refi?**

A: 65%

**Q: What is the max LTV for a 660+ FICO, loan $2.5M–$3M, Purchase?**

A: 65%

**Q: What is the max LTV for a 660+ FICO, loan $2.5M–$3M, Rate/Term Refi?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 660+ FICO, loan $2.5M–$3M, Cash-Out Refi?**`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 6,
    },
    {
      id: 'dscrInvestorSolutions-007',
      section: 'LTV Matrix (DSCR >= 1.00)',
      headingLevel: 2,
      content: `A: Not Allowed (NA)

**Q: What is the max LTV for a 640+ FICO, loan up to $1M, Purchase?**

A: 75%

**Q: What is the max LTV for a 640+ FICO, loan up to $1M, Rate/Term Refi?**

A: 70%

**Q: What is the max LTV for a 640+ FICO, loan up to $1M, Cash-Out Refi?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 640+ FICO, loan $1M–$1.5M, Purchase?**

A: 65%

**Q: What is the max LTV for a 640+ FICO, loan $1M–$1.5M, Rate/Term Refi?**

A: 65%

**Q: What is the max LTV for a 640+ FICO, loan $1M–$1.5M, Cash-Out Refi?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 640+ FICO, loan $1.5M–$2M, Purchase?**

A: 65%

**Q: What is the max LTV for a 640+ FICO, loan $1.5M–$2M, Rate/Term Refi?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 640+ FICO, loan $1.5M–$2M, Cash-Out Refi?**

A: Not Allowed (NA)`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 7,
    },
    {
      id: 'dscrInvestorSolutions-008',
      section: 'LTV Matrix (DSCR >= 1.00)',
      headingLevel: 2,
      content: `**Q: What is the max LTV for a 640+ FICO, loan $2M–$3M, Purchase?**

A: 60%

**Q: What is the max LTV for a 640+ FICO, loan $2M–$3M, Rate/Term Refi?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 640+ FICO, loan $2M–$3M, Cash-Out Refi?**

A: Not Allowed (NA)

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 8,
    },
    {
      id: 'dscrInvestorSolutions-009',
      section: 'LTV Matrix (DSCR < 1.00)',
      headingLevel: 2,
      content: `**Category:** LTV Matrix (DSCR < 1.00) | **31 rules**

**Q: What is the max LTV for a 700+ FICO, loan up to $1M, Purchase (DSCR < 1.00)?**

A: 75%

**Q: What is the max LTV for a 700+ FICO, loan up to $1M, Rate/Term Refi (DSCR < 1.00)?**

A: 70%

**Q: What is the max LTV for a 700+ FICO, loan up to $1M, Cash-Out Refi (DSCR < 1.00)?**

A: 70%

**Q: What is the max LTV for a 700+ FICO, loan $1M–$1.5M, Purchase (DSCR < 1.00)?**

A: 75%

**Q: What is the max LTV for a 700+ FICO, loan $1M–$1.5M, Rate/Term Refi (DSCR < 1.00)?**

A: 70%

**Q: What is the max LTV for a 700+ FICO, loan $1M–$1.5M, Cash-Out Refi (DSCR < 1.00)?**

A: 70%

**Q: What is the max LTV for a 700+ FICO, loan $1.5M–$2M, Purchase (DSCR < 1.00)?**

A: 70%

**Q: What is the max LTV for a 700+ FICO, loan $1.5M–$2M, Rate/Term Refi (DSCR < 1.00)?**

A: 65%`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 9,
    },
    {
      id: 'dscrInvestorSolutions-010',
      section: 'LTV Matrix (DSCR < 1.00)',
      headingLevel: 2,
      content: `**Q: What is the max LTV for a 700+ FICO, loan $1.5M–$2M, Cash-Out Refi (DSCR < 1.00)?**

A: 65%

**Q: What is the max LTV for a 700+ FICO, loan $2M–$2.5M, Purchase (DSCR < 1.00)?**

A: 65%

**Q: What is the max LTV for a 700+ FICO, loan $2M–$2.5M, Rate/Term Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 700+ FICO, loan $2M–$2.5M, Cash-Out Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 700+ FICO, loan $2.5M–$3M, Purchase (DSCR < 1.00)?**

A: 60%

**Q: What is the max LTV for a 700+ FICO, loan $2.5M–$3M, Rate/Term Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 700+ FICO, loan $2.5M–$3M, Cash-Out Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 680+ FICO, loan up to $1M, Purchase (DSCR < 1.00)?**

A: 70%`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 10,
    },
    {
      id: 'dscrInvestorSolutions-011',
      section: 'LTV Matrix (DSCR < 1.00)',
      headingLevel: 2,
      content: `**Q: What is the max LTV for a 680+ FICO, loan up to $1M, Rate/Term Refi (DSCR < 1.00)?**

A: 65%

**Q: What is the max LTV for a 680+ FICO, loan up to $1M, Cash-Out Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 680+ FICO, loan $1M–$1.5M, Purchase (DSCR < 1.00)?**

A: 70%

**Q: What is the max LTV for a 680+ FICO, loan $1M–$1.5M, Rate/Term Refi (DSCR < 1.00)?**

A: 65%

**Q: What is the max LTV for a 680+ FICO, loan $1M–$1.5M, Cash-Out Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 680+ FICO, loan $1.5M–$2M, Purchase (DSCR < 1.00)?**

A: 65%

**Q: What is the max LTV for a 680+ FICO, loan $1.5M–$2M, Rate/Term Refi (DSCR < 1.00)?**

A: 60%

**Q: What is the max LTV for a 680+ FICO, loan $1.5M–$2M, Cash-Out Refi (DSCR < 1.00)?**

A: Not Allowed (NA)`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 11,
    },
    {
      id: 'dscrInvestorSolutions-012',
      section: 'LTV Matrix (DSCR < 1.00)',
      headingLevel: 2,
      content: `**Q: What is the max LTV for a 680+ FICO, loan $2M–$3M, Purchase (DSCR < 1.00)?**

A: 60%

**Q: What is the max LTV for a 680+ FICO, loan $2M–$3M, Rate/Term Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 680+ FICO, loan $2M–$3M, Cash-Out Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 660+ FICO, loan up to $1M, Purchase (DSCR < 1.00)?**

A: 65%

**Q: What is the max LTV for a 660+ FICO, loan up to $1M, Rate/Term Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the max LTV for a 660+ FICO, loan up to $1M, Cash-Out Refi (DSCR < 1.00)?**

A: Not Allowed (NA)

**Q: What is the minimum FICO score allowed when DSCR is below 1.00?**

A: 660 (Purchase only, up to $1M, max 65% LTV)

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 12,
    },
    {
      id: 'dscrInvestorSolutions-013',
      section: 'Property Type',
      headingLevel: 2,
      content: `**Category:** Property Type | **4 rules**

**Q: What property types are eligible for the Investor Solutions DSCR program?**

A: Single Family (Attached, Detached), 2-4 Units, and Condominiums.

**Q: Are Condo Hotels eligible?**

A: Yes. Max LTV/CLTV: Purchase 75%, Refinance 65%, Max Loan Amount $1,500,000.

**Q: Are rural properties eligible?**

A: Yes. Max LTV/CLTV: Purchase 75%, Refinance 70%.

**Q: What is the maximum acreage allowed?**

A: Up to 5 acres.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 13,
    },
    {
      id: 'dscrInvestorSolutions-014',
      section: 'DSCR Calculation',
      headingLevel: 2,
      content: `**Category:** DSCR Calculation | **9 rules**

**Q: How is DSCR calculated for long-term rentals?**

A: DSCR = Monthly Gross Rents ÷ PITIA (or ITIA). PITIA includes Principal, Interest, Taxes, Insurance, and Association dues.

**Q: How is DSCR calculated for short-term rentals?**

A: DSCR = (Monthly Gross Rents × 0.80) ÷ PITIA (or ITIA). The 20% reduction accounts for extraordinary costs (advertising, furnishings, cleaning).

**Q: What rent documentation is used for Purchase (long-term)?**

A: Monthly Gross Rents from FNMA Form 1007 or 1025 reflecting long-term market rents. If tenant occupied, must reflect current monthly rent.

**Q: What is the 120% rent cap rule?**`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 14,
    },
    {
      id: 'dscrInvestorSolutions-015',
      section: 'DSCR Calculation',
      headingLevel: 2,
      content: `A: If actual lease exceeds estimated market rent by more than 120%, rents are capped at 120% of market rent. Same applies in reverse — market rent capped at 120% of lease amount.

**Q: What happens if no lease is provided on a refinance?**

A: LTV/CLTV is limited to the lesser of 70% or the LTV per the DSCR/FICO/Loan balance matrix.

**Q: Are month-to-month leases allowed?**

A: Yes. Leases that have been converted to month-to-month are allowed.

**Q: How is STR income documented?**

A: Any of: (1) STR analysis form or 1007/1025 by licensed appraiser, (2) 12-month rental history from 3rd party service (net of fees), (3) 12-month bank statements with rental records, (4) AIRDNA Rentalizer Report (Purchase only, Market Score >=60).

**Q: What are AIRDNA Rentalizer requirements?**`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 15,
    },
    {
      id: 'dscrInvestorSolutions-016',
      section: 'DSCR Calculation',
      headingLevel: 2,
      content: `A: Purchase transactions only. 12-month forecast within 90 days of Note date. Max 2 occupants per bedroom. 3 comparable properties required. Market/Sub-Market Score >=60.

**Q: What if STR actual expenses exceed 20%?**

A: If actual expenses exceed the 20% factor, the actual expense factor must be used. The 20% is a minimum floor.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 16,
    },
    {
      id: 'dscrInvestorSolutions-017',
      section: 'Housing History',
      headingLevel: 2,
      content: `**Category:** Housing History | **1 rules**

**Q: What housing payment history is required?**

A: 1x30x12: No reduction. 0x60x12: Max 70% LTV Purchase, Max 65% LTV Rate/Term & Cash-Out.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 17,
    },
    {
      id: 'dscrInvestorSolutions-018',
      section: 'Credit Events',
      headingLevel: 2,
      content: `**Category:** Credit Events | **2 rules**

**Q: What is the seasoning requirement for BK/FC/SS/DIL/Pre-FC/MC?**

A: >=36 months: No reduction. >=24 months: Max 75% LTV Purchase, Max 70% LTV Rate/Term & Cash-Out.

**Q: What is the seasoning requirement for Forbearance, Modification, or Deferral?**

A: Must be greater than 12 months seasoned.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 18,
    },
    {
      id: 'dscrInvestorSolutions-019',
      section: 'Investor Experience',
      headingLevel: 2,
      content: `**Category:** Investor Experience | **2 rules**

**Q: What qualifies as an Experienced Investor?**

A: Borrower/guarantor must have a history of owning and managing commercial or non-owner occupied residential real estate for at least 1 year in the last 3 years.

**Q: Are First-Time Investors allowed?**

A: Yes, with restrictions: Not a first-time homebuyer, Min 700 FICO, >=36 months seasoning from any credit event, 1-Unit only, DSCR > 1.00, Must own a primary residence.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 19,
    },
    {
      id: 'dscrInvestorSolutions-020',
      section: 'Unleased Properties',
      headingLevel: 2,
      content: `**Category:** Unleased Properties | **1 rules**

**Q: Are vacant/unleased properties allowed on refinances?**

A: Yes, for long-term rentals: max LTV 70%. Not applicable for short-term rentals (see STR income section).

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 20,
    },
    {
      id: 'dscrInvestorSolutions-021',
      section: 'Refi Seasoning',
      headingLevel: 2,
      content: `**Category:** Refi Seasoning | **3 rules**

**Q: What valuation is used for refinances with 0–6 months ownership?**

A: Rate/Term: Lesser of Purchase Price + Improvements or Appraised Value. Cash-Out: Lesser of Purchase Price + Improvements or Appraised Value.

**Q: What valuation is used for refinances with >6 months ownership?**

A: Appraised Value for both Rate/Term and Cash-Out.

**Q: Can appraised value be used under 6 months for RTL/Renovation Cash-Out?**

A: Yes, if property was purchased and renovated per appraisal with SSR of 2.5 and below. See full guidelines for details.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 21,
    },
    {
      id: 'dscrInvestorSolutions-022',
      section: 'Underwriting',
      headingLevel: 2,
      content: `**Category:** Underwriting | **6 rules**

**Q: How is the credit score determined?**

A: Use the representative credit score of the borrower/guarantor with the highest representative score.

**Q: What are the tradeline requirements?**

A: If borrower has 3 credit scores, tradeline requirement is waived. Otherwise: Min 2 tradelines reporting 24 months with activity in last 12 months, OR 3 tradelines reporting 12 months with recent activity.

**Q: What asset documentation is required?**

A: Minimum 30 days of asset verification.

**Q: What are the reserve requirements?**

A: Standard: 2 months PITIA. Loan > $1.5M: 6 months PITIA. Loan > $2.5M: 12 months PITIA. Cash-out proceeds may be used to satisfy reserves.

**Q: Are gift funds allowed?**

A: Yes, after a minimum 10% borrower contribution.`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 22,
    },
    {
      id: 'dscrInvestorSolutions-023',
      section: 'Underwriting',
      headingLevel: 2,
      content: `**Q: What is the document age limit?**

A: 120 days.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 23,
    },
    {
      id: 'dscrInvestorSolutions-024',
      section: 'Prepayment Penalty',
      headingLevel: 2,
      content: `**Category:** Prepayment Penalty | **3 rules**

**Q: What prepayment penalty structures are allowed?**

A: Periods up to 5 years. Fixed percentage no less than 3%. Declining structures cannot exceed 5% and cannot drop below 3% in the first 3 years.

**Q: In which states are prepayment penalties not allowed?**

A: AK, KS, MI, MN, NM, and RI. Also not allowed on loans vested to individuals in IL and NJ.

**Q: Are there special prepay rules for OH and PA?**

A: OH: Penalties on 1-2 unit properties cannot exceed 1% of loan balance during first 5 years. PA: Penalties not allowed on loan amounts less than $319,777.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 24,
    },
    {
      id: 'dscrInvestorSolutions-025',
      section: 'Escrows',
      headingLevel: 2,
      content: `**Category:** Escrows | **1 rules**

**Q: Can escrows be waived?**

A: Yes, escrows may be waived per Section 2.4.5 – Escrow/Impounds requirements.

---`,
      sourceDocId: 'dscrInvestorSolutions',
      chunkIndex: 25,
    },
  ],
};

export default dscrInvestorSolutions;
